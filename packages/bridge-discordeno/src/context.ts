import type { CommandContext, ScoutContext } from "@stratum/core";
import {
  InteractionResponseTypes,
  InteractionTypes,
  MessageFlags,
} from "@discordeno/bot";
import type { StratumBot } from "./createStratumDiscordenoBot.js";
import type { DiscordenoInteraction, DiscordenoMessage } from "./types.js";

const replied = new WeakSet<object>();

function idString(value: bigint | undefined | null): string | null {
  return value === undefined || value === null ? null : String(value);
}

export function createScoutContext(
  bot: StratumBot,
  message: DiscordenoMessage,
  trigger: ScoutContext["trigger"] = "message",
): ScoutContext {
  return {
    trigger,
    userId: message.author?.id ? String(message.author.id) : null,
    guildId: idString(message.guildId),
    channelId: idString(message.channelId),
    content: message.content ?? null,
    raw: message,
    delete: async () => {
      if (message.channelId && message.id) {
        await bot.helpers.deleteMessage(message.channelId, message.id);
      }
    },
  };
}

export function commandContextFromMessage(
  bot: StratumBot,
  message: DiscordenoMessage,
  commandName: string,
): CommandContext {
  return {
    kind: "prefix",
    commandName,
    userId: String(message.author!.id),
    guildId: idString(message.guildId),
    channelId: idString(message.channelId),
    raw: message,
    reply: async (text) => {
      if (!message.channelId) return;
      await bot.helpers.sendMessage(message.channelId, {
        content: text,
        ...(message.id
          ? { messageReference: { messageId: message.id, failIfNotExists: false } }
          : {}),
      });
    },
    replyEphemeral: async (text) => {
      if (!message.channelId) return;
      await bot.helpers.sendMessage(message.channelId, {
        content: text,
        ...(message.id
          ? { messageReference: { messageId: message.id, failIfNotExists: false } }
          : {}),
      });
    },
  };
}

export function commandContextFromSlash(
  bot: StratumBot,
  interaction: DiscordenoInteraction,
): CommandContext {
  const name = interaction.data?.name ?? "unknown";

  return {
    kind: "slash",
    commandName: name,
    userId: String(interaction.user!.id),
    guildId: idString(interaction.guildId),
    channelId: idString(interaction.channelId),
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
  };
}

export function getInteractionCustomId(interaction: DiscordenoInteraction): string | null {
  const customId = interaction.data?.customId;
  return typeof customId === "string" ? customId : null;
}

export function isApplicationCommand(interaction: DiscordenoInteraction): boolean {
  return interaction.type === InteractionTypes.ApplicationCommand;
}

export function isMessageComponent(interaction: DiscordenoInteraction): boolean {
  return interaction.type === InteractionTypes.MessageComponent;
}

export function isModalSubmit(interaction: DiscordenoInteraction): boolean {
  return interaction.type === InteractionTypes.ModalSubmit;
}

export function isMessageAuthorBot(message: DiscordenoMessage): boolean {
  return Boolean(message.author?.bot);
}
