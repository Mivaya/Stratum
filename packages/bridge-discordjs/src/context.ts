import type { CommandContext, ScoutContext } from "@stratum/core";
import {
  MessageFlags,
  type ChatInputCommandInteraction,
  type Message,
  type PartialMessage,
} from "discord.js";

export function scoutContextFromMessage(
  message: Message | PartialMessage,
  trigger: ScoutContext["trigger"] = "message",
): ScoutContext {
  return {
    trigger,
    userId: message.author?.id ?? null,
    guildId: message.guildId,
    channelId: message.channelId,
    content: message.content,
    raw: message,
    delete: async () => {
      if ("delete" in message && typeof message.delete === "function") {
        await message.delete();
      }
    },
  };
}

export function commandContextFromMessage(message: Message, commandName: string): CommandContext {
  return {
    kind: "prefix",
    commandName,
    userId: message.author.id,
    guildId: message.guildId,
    channelId: message.channelId,
    raw: message,
    reply: async (text) => {
      await message.reply(text);
    },
    replyEphemeral: async (text) => {
      await message.reply({ content: text, allowedMentions: { repliedUser: false } });
    },
  };
}

export function commandContextFromSlash(interaction: ChatInputCommandInteraction): CommandContext {
  return {
    kind: "slash",
    commandName: interaction.commandName,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
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
  };
}

/** @deprecated Use {@link commandContextFromMessage} */
export const directiveContextFromMessage = commandContextFromMessage;

/** @deprecated Use {@link commandContextFromSlash} */
export const directiveContextFromSlash = commandContextFromSlash;
