import { defineGate, type CommandContext, type GateLike } from "@stambha/core";
import { type CooldownStore, defaultCooldownStore } from "./cooldownStore.js";

export type CooldownScope = "user" | "guild" | "global" | "userGuild";

export interface CooldownGateOptions {
  /** Max invocations per window. */
  limit: number;
  /** Window length in milliseconds. */
  delay: number;
  /** Bucket scope (default `userGuild`). */
  scope?: CooldownScope;
  /** User IDs that bypass the cooldown. */
  filteredUsers?: readonly string[];
  /** Include command name in the bucket key (default `true`). */
  perCommand?: boolean;
  store?: CooldownStore;
  message?: (retryAfterMs: number) => string;
}

function cooldownKey(ctx: CommandContext, scope: CooldownScope, perCommand: boolean): string {
  const parts = ["stambha:cooldown"];
  if (perCommand) parts.push(ctx.commandName);

  switch (scope) {
    case "global":
      break;
    case "user":
      parts.push(`u:${ctx.userId}`);
      break;
    case "guild":
      parts.push(`g:${ctx.guildId ?? "dm"}`);
      break;
    case "userGuild":
      parts.push(`u:${ctx.userId}`, `g:${ctx.guildId ?? "dm"}`);
      break;
  }

  return parts.join(":");
}

function formatRetry(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  return seconds <= 1 ? "1 second" : `${seconds} seconds`;
}

/**
 * Rate-limit gate inspired by Sapphire's Cooldown precondition.
 */
export function cooldownGate(options: CooldownGateOptions): GateLike {
  const scope = options.scope ?? "userGuild";
  const perCommand = options.perCommand ?? true;
  const store = options.store ?? defaultCooldownStore;
  const filtered = new Set(options.filteredUsers ?? []);

  return defineGate(`cooldown(${scope})`, (ctx) => {
    if (filtered.has(ctx.userId)) return { allow: true };

    const key = cooldownKey(ctx, scope, perCommand);
    const result = store.consume(key, options.limit, options.delay);

    if (result.allowed) return { allow: true };

    const reason =
      options.message?.(result.retryAfterMs) ??
      `Slow down — try again in ${formatRetry(result.retryAfterMs)}.`;

    return { allow: false, reason };
  });
}
