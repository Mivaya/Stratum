import type { CommandContext, ResolvedDesiredProperties, RestPort } from "@stratum/core";
import { slimCommandContext, slimMeta } from "@stratum/core";
import {
  Routes,
  type ChatInputCommandInteraction,
  type Message,
} from "discord.js";
import {
  channelMessageBody,
  interactionReplyBody,
  metaFromDiscordJsMessage,
  metaFromDiscordJsSlash,
} from "@stratum/transform";
import { slashOptionsFromInteraction } from "../slashOptions.js";
import { slashPathFromInteraction } from "../slashPath.js";
import type { ContextBuildOptions } from "../context.js";

function applicationId(interaction: ChatInputCommandInteraction): string {
  return interaction.applicationId;
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

export function commandContextFromSlashViaRest(
  interaction: ChatInputCommandInteraction,
  restPort: RestPort,
  options?: ContextBuildOptions,
): CommandContext {
  const desired = options?.desired;
  const meta = desired?.context.meta !== false ? metaFromDiscordJsSlash(interaction) : undefined;
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
        await restPort.request({
          method: "POST",
          route: Routes.webhook(applicationId(interaction), interaction.token),
          body: channelMessageBody(text),
        });
      } else {
        await restPort.request({
          method: "POST",
          route: Routes.interactionCallback(interaction.id, interaction.token),
          body: interactionReplyBody(text),
        });
      }
    },
    replyEphemeral: async (text) => {
      const body = interactionReplyBody(text, true);
      if (interaction.replied || interaction.deferred) {
        await restPort.request({
          method: "POST",
          route: Routes.webhook(applicationId(interaction), interaction.token),
          body: body.data,
        });
      } else {
        await restPort.request({
          method: "POST",
          route: Routes.interactionCallback(interaction.id, interaction.token),
          body,
        });
      }
    },
  };
  return finalize(full, desired);
}

export function commandContextFromMessageViaRest(
  message: Message,
  commandName: string,
  restPort: RestPort,
  argsText = "",
  options?: ContextBuildOptions,
): CommandContext {
  const desired = options?.desired;
  const meta = desired?.context.meta !== false ? metaFromDiscordJsMessage(message) : undefined;
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
      await restPort.request({
        method: "POST",
        route: Routes.channelMessages(message.channelId),
        body: {
          ...channelMessageBody(text),
          message_reference: { message_id: message.id },
        },
      });
    },
    replyEphemeral: async (text) => {
      await restPort.request({
        method: "POST",
        route: Routes.channelMessages(message.channelId),
        body: {
          ...channelMessageBody(text),
          message_reference: { message_id: message.id },
        },
      });
    },
  };
  return finalize(full, desired);
}
