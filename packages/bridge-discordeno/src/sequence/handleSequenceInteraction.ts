import { isSequenceCustomId, parseSequenceCustomId, type SequenceStore } from "@stratum/core";
import { InteractionResponseTypes, MessageFlags } from "@discordeno/bot";
import type { StratumBot } from "../createStratumDiscordenoBot.js";
import {
  getInteractionCustomId,
  isMessageComponent,
  isModalSubmit,
} from "../context.js";
import type { DiscordenoInteraction } from "../types.js";

export async function handleSequenceInteraction(
  bot: StratumBot,
  interaction: DiscordenoInteraction,
  store: SequenceStore,
): Promise<boolean> {
  if (!isMessageComponent(interaction) && !isModalSubmit(interaction)) return false;

  const customId = getInteractionCustomId(interaction);
  if (!customId || !isSequenceCustomId(customId)) return false;

  const parsed = parseSequenceCustomId(customId);
  if (!parsed) return false;

  let value: unknown;

  if (isMessageComponent(interaction)) {
    value = interaction;
  } else if (isModalSubmit(interaction)) {
    const fields: Record<string, string> = {};
    for (const row of interaction.data?.components ?? []) {
      for (const field of row.components ?? []) {
        if (field.customId) fields[field.customId] = String(field.value ?? "");
      }
    }
    value = fields;
  }

  const userId = interaction.user?.id ? String(interaction.user.id) : "";
  const status = store.completeStep(parsed.sessionId, parsed.stepId, userId, value);

  if (status === "wrong_user") {
    if (!interaction.acknowledged && interaction.id && interaction.token) {
      await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: { content: "This flow belongs to someone else.", flags: MessageFlags.Ephemeral },
      });
    }
    return true;
  }

  if (status === "ok" && !interaction.acknowledged && interaction.id && interaction.token) {
    await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.DeferredUpdateMessage,
    });
  }

  return true;
}
