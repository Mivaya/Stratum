import { isSequenceCustomId, parseSequenceCustomId, type SequenceStore } from "@stratum/core";
import { MessageFlags, type Interaction } from "discord.js";

export async function handleSequenceInteraction(
  interaction: Interaction,
  store: SequenceStore,
): Promise<boolean> {
  if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) {
    return false;
  }

  if (!isSequenceCustomId(interaction.customId)) return false;

  const parsed = parseSequenceCustomId(interaction.customId);
  if (!parsed) return false;

  let value: unknown;

  if (interaction.isButton()) {
    value = interaction;
  } else if (interaction.isStringSelectMenu()) {
    value = interaction.values;
  } else if (interaction.isModalSubmit()) {
    const fields: Record<string, string> = {};
    for (const id of interaction.fields.fields.keys()) {
      fields[id] = interaction.fields.getTextInputValue(id);
    }
    value = fields;
  }

  const status = store.completeStep(parsed.sessionId, parsed.stepId, interaction.user.id, value);

  if (status === "wrong_user") {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "This flow belongs to someone else.", flags: MessageFlags.Ephemeral });
    }
    return true;
  }

  if (status === "ok") {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferUpdate().catch(() => undefined);
    }
    return true;
  }

  return true;
}
