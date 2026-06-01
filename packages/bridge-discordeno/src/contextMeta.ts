import type { ChannelType, CommandContextMeta } from "@stratum/core";
import type { DiscordenoInteraction, DiscordenoMessage } from "./types.js";

/** Best-effort metadata for Discordeno (depends on desiredProperties). */
export function commandContextMetaFromMessage(
  message: DiscordenoMessage,
): CommandContextMeta | undefined {
  if (!message.guildId) {
    return { channelType: "dm", channelNsfw: false };
  }

  const meta: CommandContextMeta = { channelType: "guild_text" };
  return meta;
}

export function commandContextMetaFromSlash(
  interaction: DiscordenoInteraction,
): CommandContextMeta | undefined {
  if (!interaction.guildId) {
    return { channelType: "dm", channelNsfw: false };
  }

  const meta: CommandContextMeta = { channelType: "guild_text" };

  const member = interaction.member;
  if (member && "permissions" in member && member.permissions !== undefined) {
    meta.memberPermissions = BigInt(String(member.permissions));
  }

  return meta;
}

export type { ChannelType };
