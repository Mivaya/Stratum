import type { SignalContext } from "@stratum/core";
import {
  MessageFlags,
  type ButtonInteraction,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
} from "discord.js";

type ComponentInteraction = ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction;

export function signalContextFromInteraction(
  interaction: ComponentInteraction,
  signalName: string,
): SignalContext {
  return {
    signalName,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    customId: interaction.customId,
    raw: interaction,
    reply: async (text) => {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(text);
      } else {
        await interaction.reply(text);
      }
    },
    replyEphemeral: async (text) => {
      const flags = MessageFlags.Ephemeral;
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: text, flags });
      } else {
        await interaction.reply({ content: text, flags });
      }
    },
    deferReply: async () => {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply();
      }
    },
  };
}
