import type { ResolvedDesiredProperties, CommandContext, ScoutContext } from "@stratum/core";
import { slimCommandContext, slimMeta } from "@stratum/core";
import {
  MessageFlags,
  type ChatInputCommandInteraction,
  type Message,
  type PartialMessage,
} from "discord.js";
import { metaFromDiscordJsMessage, metaFromDiscordJsSlash } from "@stratum/transform";
import { slashOptionsFromInteraction } from "./slashOptions.js";
import { slashPathFromInteraction } from "./slashPath.js";

export interface ContextBuildOptions {
  desired?: ResolvedDesiredProperties;
}

function applyDesired(ctx: CommandContext, desired?: ResolvedDesiredProperties): CommandContext {
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

export function commandContextFromMessage(
  message: Message,
  commandName: string,
  argsText = "",
  options?: ContextBuildOptions,
): CommandContext {
  const meta = options?.desired?.context.meta !== false ? metaFromDiscordJsMessage(message) : undefined;
  const full: CommandContext = {
    kind: "prefix",
    commandName,
    userId: message.author.id,
    guildId: message.guildId,
    channelId: message.channelId,
    ...(meta !== undefined ? { meta } : {}),
    ...(argsText.length > 0 ? { argsText } : {}),
    raw: message,
    reply: async (text) => {
      await message.reply(text);
    },
    replyEphemeral: async (text) => {
      await message.reply({ content: text, allowedMentions: { repliedUser: false } });
    },
  };
  return applyDesired(full, options?.desired);
}

export function commandContextFromSlash(
  interaction: ChatInputCommandInteraction,
  options?: ContextBuildOptions,
): CommandContext {
  const meta =
    options?.desired?.context.meta !== false ? metaFromDiscordJsSlash(interaction) : undefined;
  const slashOptions = slashOptionsFromInteraction(interaction);
  const slashPath = slashPathFromInteraction(interaction);
  const full: CommandContext = {
    kind: "slash",
    commandName: slashPath.root,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    ...(meta !== undefined ? { meta } : {}),
    ...(slashOptions.length > 0 ? { slashOptions } : {}),
    slashPath,
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
  return applyDesired(full, options?.desired);
}

/** @deprecated Use {@link commandContextFromMessage} */
export const directiveContextFromMessage = commandContextFromMessage;

/** @deprecated Use {@link commandContextFromSlash} */
export const directiveContextFromSlash = commandContextFromSlash;
