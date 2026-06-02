import {
  defineGate,
  isGuildChannelType,
  type ChannelType,
  type GateLike,
} from "@stratum/core";

/** Sapphire-style RunIn channel presets. */
export const RunIn = {
  DM: "dm" as const,
  GuildText: "guild_text" as const,
  GuildVoice: "guild_voice" as const,
  GuildNews: "guild_news" as const,
  GuildStage: "guild_stage" as const,
  GuildForum: "guild_forum" as const,
  GuildNewsThread: "guild_news_thread" as const,
  GuildPublicThread: "guild_public_thread" as const,
  GuildPrivateThread: "guild_private_thread" as const,
  /** Any guild channel (excludes DM and group DM). */
  GuildAny: "guild_any" as const,
};

export type RunInOption = ChannelType | typeof RunIn.GuildAny;

export interface RunInGateOptions {
  message?: string;
}

const GUILD_TYPES: ReadonlySet<ChannelType> = new Set([
  "guild_text",
  "guild_voice",
  "guild_news",
  "guild_stage",
  "guild_forum",
  "guild_news_thread",
  "guild_public_thread",
  "guild_private_thread",
]);

function matchesRunIn(type: ChannelType, allowed: RunInOption): boolean {
  if (allowed === RunIn.GuildAny) return isGuildChannelType(type);
  return type === allowed;
}

/**
 * Restrict commands to specific channel types. Inspired by Sapphire's RunIn precondition.
 */
export function runInGate(...allowed: RunInOption[]): GateLike;
export function runInGate(options: RunInGateOptions, ...allowed: RunInOption[]): GateLike;
export function runInGate(
  first: RunInGateOptions | RunInOption,
  ...rest: RunInOption[]
): GateLike {
  let options: RunInGateOptions = {};
  let allowed: RunInOption[];

  if (typeof first === "object") {
    options = first;
    allowed = rest;
  } else {
    allowed = [first, ...rest];
  }

  if (allowed.length === 0) {
    throw new Error("runInGate requires at least one channel type.");
  }

  const label = allowed.join(",");

  return defineGate(`runIn(${label})`, (ctx) => {
    const type = ctx.meta?.channelType;
    if (type === undefined) return { allow: true };

    for (const option of allowed) {
      if (matchesRunIn(type, option)) return { allow: true };
    }

    return {
      allow: false,
      reason: options.message ?? `This command cannot be used in this channel type.`,
    };
  });
}

/** Convenience: guild-only commands (no DMs). */
export function guildOnlyGate(message?: string): GateLike {
  return runInGate({ message: message ?? "This command can only be used in a server." }, RunIn.GuildAny);
}

/** Convenience: DM-only commands. */
export function dmOnlyGate(message?: string): GateLike {
  return runInGate({ message: message ?? "This command can only be used in DMs." }, RunIn.DM);
}

export { GUILD_TYPES };
