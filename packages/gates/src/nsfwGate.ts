import { defineGate, type GateLike } from "@stratum/core";

export interface NsfwGateOptions {
  message?: string;
}

/**
 * Requires an NSFW channel. Inspired by Sapphire's NSFW precondition.
 * When `meta.channelNsfw` is unknown, the gate allows (bridges should populate meta).
 */
export function nsfwGate(options: NsfwGateOptions = {}): GateLike {
  return defineGate("nsfw", (ctx) => {
    const nsfw = ctx.meta?.channelNsfw;
    if (nsfw === undefined) return { allow: true };
    if (nsfw) return { allow: true };
    return {
      allow: false,
      reason: options.message ?? "This command may only be used in NSFW channels.",
    };
  });
}
