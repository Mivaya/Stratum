import type { CommandContextMeta } from "@stambha/core";
import type { ResolvedDesiredProperties } from "@stambha/core";
import type { StambhaMessage, StambhaSlashInteraction, StambhaUser } from "./shapes.js";

export interface DiscordenoMessageLike {
  id?: bigint;
  content?: string;
  channelId?: bigint;
  guildId?: bigint;
  author?: { id?: bigint; bot?: boolean; username?: string };
}

export interface DiscordenoInteractionLike {
  id?: bigint;
  token?: string;
  user?: { id?: bigint; bot?: boolean };
  guildId?: bigint;
  channelId?: bigint;
  member?: { permissions?: bigint | string };
}

function idString(value: bigint | undefined | null): string | null {
  return value === undefined || value === null ? null : String(value);
}

export function userFromDiscordeno(user: { id?: bigint; bot?: boolean; username?: string }): StambhaUser {
  return { id: String(user.id!), ...(user.bot !== undefined ? { bot: user.bot } : {}) };
}

export function messageFromDiscordeno(message: DiscordenoMessageLike): StambhaMessage {
  return {
    id: message.id ? String(message.id) : null,
    content: message.content ?? "",
    channelId: idString(message.channelId),
    guildId: idString(message.guildId),
    author: message.author?.id ? userFromDiscordeno(message.author) : { id: "0" },
  };
}

export function slashInteractionFromDiscordeno(
  interaction: DiscordenoInteractionLike,
): StambhaSlashInteraction {
  return {
    id: interaction.id ? String(interaction.id) : null,
    token: interaction.token ?? null,
    user: interaction.user?.id ? userFromDiscordeno(interaction.user) : { id: "0" },
    guildId: idString(interaction.guildId),
    channelId: idString(interaction.channelId),
  };
}

export function metaFromDiscordenoMessage(message: DiscordenoMessageLike): CommandContextMeta | undefined {
  if (!message.guildId) {
    return { channelType: "dm", channelNsfw: false };
  }
  return { channelType: "guild_text" };
}

export function metaFromDiscordenoSlash(
  interaction: DiscordenoInteractionLike,
): CommandContextMeta | undefined {
  if (!interaction.guildId) {
    return { channelType: "dm", channelNsfw: false };
  }

  const meta: CommandContextMeta = { channelType: "guild_text" };
  const member = interaction.member;
  if (member?.permissions !== undefined) {
    meta.memberPermissions = BigInt(String(member.permissions));
  }
  return meta;
}

/** Base Discordeno desired-properties preset for Stambha routing. */
export const defaultDiscordenoDesiredProperties = {
  user: { id: true, bot: true, username: true },
  message: { id: true, content: true, channelId: true, guildId: true, author: true },
  interaction: {
    id: true,
    type: true,
    token: true,
    data: true,
    user: true,
    guildId: true,
    channelId: true,
    acknowledged: true,
  },
} as const;

/** Extend Discordeno gateway trimming based on Stambha {@link ResolvedDesiredProperties}. */
export function buildDiscordenoDesiredProperties(
  resolved: ResolvedDesiredProperties,
): Record<string, unknown> {
  const interaction: Record<string, boolean> = {
    ...defaultDiscordenoDesiredProperties.interaction,
  };

  if (resolved.meta.memberPermissions) {
    interaction.member = true;
  }

  return {
    user: { ...defaultDiscordenoDesiredProperties.user },
    message: { ...defaultDiscordenoDesiredProperties.message },
    interaction,
  };
}
