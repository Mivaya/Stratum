import type { SignalContext } from "@stratum/core";
import { InteractionResponseTypes, MessageFlags } from "@discordeno/bot";
import type { StratumBot } from "./createStratumDiscordenoBot.js";
import type { DiscordenoInteraction } from "./types.js";

const replied = new WeakSet<object>();

export function signalContextFromInteraction(
  bot: StratumBot,
  interaction: DiscordenoInteraction,
  signalName: string,
): SignalContext {
  return {
    signalName,
    userId: String(interaction.user!.id),
    guildId: interaction.guildId ? String(interaction.guildId) : null,
    channelId: interaction.channelId ? String(interaction.channelId) : null,
    customId: interaction.data?.customId ?? "",
    raw: interaction,
    reply: async (text) => {
      if (!interaction.id || !interaction.token) return;
      if (replied.has(interaction) || interaction.acknowledged) {
        await bot.helpers.sendFollowupMessage(interaction.token, { content: text });
      } else {
        await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: { content: text },
        });
        replied.add(interaction);
      }
    },
    replyEphemeral: async (text) => {
      if (!interaction.id || !interaction.token) return;
      const data = { content: text, flags: MessageFlags.Ephemeral };
      if (replied.has(interaction) || interaction.acknowledged) {
        await bot.helpers.sendFollowupMessage(interaction.token, data);
      } else {
        await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data,
        });
        replied.add(interaction);
      }
    },
    deferReply: async () => {
      if (!interaction.id || !interaction.token || replied.has(interaction) || interaction.acknowledged) {
        return;
      }
      await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.DeferredChannelMessageWithSource,
        data: { flags: MessageFlags.Ephemeral },
      });
      replied.add(interaction);
    },
  };
}
