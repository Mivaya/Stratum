import type { CommandContext, RestPort } from "@stratum/core";
import {
  InteractionResponseType,
  MessageFlags,
  Routes,
  type ChatInputCommandInteraction,
  type Message,
} from "discord.js";

function applicationId(interaction: ChatInputCommandInteraction): string {
  return interaction.applicationId;
}

export function commandContextFromSlashViaRest(
  interaction: ChatInputCommandInteraction,
  restPort: RestPort,
): CommandContext {
  return {
    kind: "slash",
    commandName: interaction.commandName,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    raw: interaction,
    reply: async (text) => {
      if (interaction.replied || interaction.deferred) {
        await restPort.request({
          method: "POST",
          route: Routes.webhook(applicationId(interaction), interaction.token),
          body: { content: text },
        });
      } else {
        await restPort.request({
          method: "POST",
          route: Routes.interactionCallback(interaction.id, interaction.token),
          body: {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: text },
          },
        });
      }
    },
    replyEphemeral: async (text) => {
      const data = { content: text, flags: MessageFlags.Ephemeral };
      if (interaction.replied || interaction.deferred) {
        await restPort.request({
          method: "POST",
          route: Routes.webhook(applicationId(interaction), interaction.token),
          body: data,
        });
      } else {
        await restPort.request({
          method: "POST",
          route: Routes.interactionCallback(interaction.id, interaction.token),
          body: {
            type: InteractionResponseType.ChannelMessageWithSource,
            data,
          },
        });
      }
    },
  };
}

export function commandContextFromMessageViaRest(
  message: Message,
  commandName: string,
  restPort: RestPort,
): CommandContext {
  return {
    kind: "prefix",
    commandName,
    userId: message.author.id,
    guildId: message.guildId,
    channelId: message.channelId,
    raw: message,
    reply: async (text) => {
      await restPort.request({
        method: "POST",
        route: Routes.channelMessages(message.channelId),
        body: { content: text, message_reference: { message_id: message.id } },
      });
    },
    replyEphemeral: async (text) => {
      await restPort.request({
        method: "POST",
        route: Routes.channelMessages(message.channelId),
        body: { content: text, message_reference: { message_id: message.id } },
      });
    },
  };
}
