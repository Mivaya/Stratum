import {
  parseSequenceCustomId,
  sequence,
  sequenceCustomId,
  type SequenceAnswers,
  type SequenceBuilder,
  type SequenceResult,
  type SequenceStore,
  type SequenceStep,
} from "@stratum/core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ChatInputCommandInteraction,
  type MessageComponentInteraction,
} from "discord.js";

export interface RunSequenceOptions {
  ephemeral?: boolean;
}

/**
 * Run a multi-step interaction sequence from a slash command (or any reply-capable interaction).
 */
export async function runSequence(
  interaction: ChatInputCommandInteraction,
  store: SequenceStore,
  build: (builder: SequenceBuilder) => void,
  options: RunSequenceOptions = {},
): Promise<SequenceResult> {
  const builder = sequence();
  build(builder);
  const { steps } = builder.build();

  const session = store.createSession({
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    timeoutMs: builder.defaultTimeout,
  });

  const answers: SequenceAnswers = {};
  let cancelled = false;

  try {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Starting…",
        flags: options.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    for (const step of steps) {
      try {
        answers[step.id] = await runStep(interaction, store, session.id, step);
      } catch {
        cancelled = true;
        break;
      }
    }
  } finally {
    store.endSession(session.id);
  }

  return { sessionId: session.id, answers, cancelled };
}

async function runStep(
  interaction: ChatInputCommandInteraction,
  store: SequenceStore,
  sessionId: string,
  step: SequenceStep,
): Promise<string | string[] | Record<string, string>> {
  const timeoutMs = step.timeoutMs ?? 60_000;

  if (step.type === "button") {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      step.buttons.map((b) =>
        new ButtonBuilder()
          .setCustomId(sequenceCustomId(sessionId, step.id, b.id))
          .setLabel(b.label)
          .setStyle(ButtonStyle.Primary),
      ),
    );

    await interaction.editReply({ content: step.prompt, components: [row] });
    const click = (await store.waitForStep(sessionId, step.id, timeoutMs)) as MessageComponentInteraction;
    const parsed = parseSequenceCustomId(click.customId);
    return parsed?.part ?? click.customId;
  }

  if (step.type === "select") {
    const menu = new StringSelectMenuBuilder()
      .setCustomId(sequenceCustomId(sessionId, step.id))
      .setPlaceholder(step.placeholder ?? "Choose…")
      .setMinValues(step.minValues ?? 1)
      .setMaxValues(step.maxValues ?? 1)
      .addOptions(step.options.map((o) => ({ label: o.label, value: o.value })));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    await interaction.editReply({ content: step.prompt, components: [row] });
    const result = await store.waitForStep(sessionId, step.id, timeoutMs);
    return result as string[];
  }

  const modalStepId = `${step.id}__modal`;
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(sequenceCustomId(sessionId, step.id, "open"))
      .setLabel(step.openLabel)
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.editReply({ content: step.prompt, components: [row] });

  const openInteraction = (await store.waitForStep(sessionId, step.id, timeoutMs)) as MessageComponentInteraction;

  await openInteraction.showModal({
    customId: sequenceCustomId(sessionId, modalStepId),
    title: step.title,
    components: step.fields.map((f) => {
      const input = new TextInputBuilder()
        .setCustomId(f.id)
        .setLabel(f.label)
        .setRequired(f.required ?? true)
        .setStyle(f.style === "paragraph" ? TextInputStyle.Paragraph : TextInputStyle.Short);
      if (f.placeholder) input.setPlaceholder(f.placeholder);
      return new ActionRowBuilder<TextInputBuilder>().addComponents(input);
    }),
  });

  const fields = (await store.waitForStep(sessionId, modalStepId, timeoutMs)) as Record<string, string>;

  await interaction.editReply({ content: step.prompt, components: [] }).catch(() => undefined);

  return fields;
}
