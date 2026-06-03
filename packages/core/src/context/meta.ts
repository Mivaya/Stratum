/** Transport-agnostic Discord channel types for gate checks. */
export type ChannelType =
  | "dm"
  | "group_dm"
  | "guild_text"
  | "guild_voice"
  | "guild_news"
  | "guild_stage"
  | "guild_forum"
  | "guild_news_thread"
  | "guild_public_thread"
  | "guild_private_thread"
  | "unknown";

/**
 * Optional metadata bridges attach for built-in gates (`@stambha/gates`).
 * When absent, gates that need metadata typically allow the command (graceful degradation).
 */
export interface CommandContextMeta {
  channelType?: ChannelType;
  channelNsfw?: boolean;
  /** Member permissions in the current channel (guild commands). */
  memberPermissions?: bigint;
  /** Bot permissions in the current channel. */
  clientPermissions?: bigint;
}

/** Returns true when the channel type is any guild channel (not DM / group DM). */
export function isGuildChannelType(type: ChannelType): boolean {
  return type !== "dm" && type !== "group_dm" && type !== "unknown";
}
