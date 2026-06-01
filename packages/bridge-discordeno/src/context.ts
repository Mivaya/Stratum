import type { CommandContext, ResolvedDesiredProperties, ScoutContext } from "@stratum/core";
import { slimCommandContext, slimMeta } from "@stratum/core";
import {
  InteractionResponseTypes,
  InteractionTypes,
  MessageFlags,
} from "@discordeno/bot";
import {
  metaFromDiscordenoMessage,
  metaFromDiscordenoSlash,
} from "@stratum/transform";
import type { StratumBot } from "./createStratumDiscordenoBot.js";
import type { DiscordenoInteraction, DiscordenoMessage } from "./types.js";
import { slashOptionsFromInteraction } from "./slashOptions.js";
import { slashPathFromInteraction } from "./slashPath.js";

const replied = new WeakSet<object>();

export interface ContextBuildOptions {
  desired?: ResolvedDesiredProperties;
}

function idString(value: bigint | undefined | null): string | null {
  return value === undefined || value === null ? null : String(value);
}

function finalize(ctx: CommandContext, desired?: ResolvedDesiredProperties): CommandContext {
  if (!desired) return ctx;
  const slim = slimCommandContext(ctx, desired);
  if (desired.context.meta && slim.meta) {
    const meta = slimMeta(slim.meta, desired.meta);
    if (meta !== undefined) return { ...slim, meta };
    const { meta: _removed, ...rest } = slim as CommandContext & { meta?: unknown };
    return rest as CommandContext;
  }
  return slim;
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
  argsText = "",
  options?: ContextBuildOptions,
): CommandContext {
  const desired = options?.desired;
  const meta = desired?.context.meta !== false ? metaFromDiscordenoMessage(message) : undefined;
  const full: CommandContext = {
    kind: "prefix",
    commandName,
    userId: String(message.author!.id),
    guildId: idString(message.guildId),
    channelId: idString(message.channelId),
    ...(meta !== undefined ? { meta } : {}),
    ...(argsText.length > 0 ? { argsText } : {}),
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
  return finalize(full, desired);
}

export function commandContextFromSlash(
  bot: StratumBot,
  interaction: DiscordenoInteraction,
  options?: ContextBuildOptions,
): CommandContext {
  const desired = options?.desired;
  const meta = desired?.context.meta !== false ? metaFromDiscordenoSlash(interaction) : undefined;
  const slashOptions = slashOptionsFromInteraction(interaction);
  const slashPath = slashPathFromInteraction(interaction);

  const full: CommandContext = {
    kind: "slash",
    commandName: slashPath.root,
    userId: String(interaction.user!.id),
    guildId: idString(interaction.guildId),
    channelId: idString(interaction.channelId),
    ...(meta !== undefined ? { meta } : {}),
    ...(slashOptions.length > 0 ? { slashOptions } : {}),
    slashPath,
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
  return finalize(full, desired);
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

export function isAutocomplete(interaction: DiscordenoInteraction): boolean {
  return interaction.type === InteractionTypes.ApplicationCommandAutocomplete;
}

export function isMessageAuthorBot(message: DiscordenoMessage): boolean {
  return Boolean(message.author?.bot);
}
