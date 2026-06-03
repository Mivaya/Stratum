import type { CommandContext, SlashOption } from "@stambha/core";
import type { ArgResult } from "./errors.js";
import { argInvalid, argMissing } from "./errors.js";
import { Args } from "./Args.js";

/**
 * Typed accessors for slash command options on {@link CommandContext.slashOptions}.
 */
export class SlashArgs {
  private readonly map: ReadonlyMap<string, SlashOption>;

  constructor(options: readonly SlashOption[]) {
    this.map = new Map(options.map((o) => [o.name, o]));
  }

  static fromContext(ctx: CommandContext): SlashArgs {
    return new SlashArgs(ctx.slashOptions ?? []);
  }

  has(name: string): boolean {
    return this.map.has(name);
  }

  get(name: string): SlashOption | undefined {
    return this.map.get(name);
  }

  getString(name: string): string | null {
    const opt = this.map.get(name);
    if (!opt || opt.type !== "string") return null;
    return String(opt.value);
  }

  getInteger(name: string): number | null {
    const opt = this.map.get(name);
    if (!opt || opt.type !== "integer") return null;
    return Number(opt.value);
  }

  getNumber(name: string): number | null {
    const opt = this.map.get(name);
    if (!opt || opt.type !== "number") return null;
    return Number(opt.value);
  }

  getBoolean(name: string): boolean | null {
    const opt = this.map.get(name);
    if (!opt || opt.type !== "boolean") return null;
    return Boolean(opt.value);
  }

  getSnowflake(name: string): string | null {
    const opt = this.map.get(name);
    if (!opt) return null;
    if (
      opt.type === "user" ||
      opt.type === "channel" ||
      opt.type === "role" ||
      opt.type === "mentionable" ||
      opt.type === "attachment"
    ) {
      return String(opt.value);
    }
    return null;
  }

  requireString(name: string): ArgResult<string> {
    const value = this.getString(name);
    if (value === null) {
      if (!this.map.has(name)) {
        return argMissing(`Missing required option "${name}".`);
      }
      return argInvalid(name, `Option "${name}" is not a string.`);
    }
    return { ok: true, value };
  }

  requireInteger(name: string): ArgResult<number> {
    const value = this.getInteger(name);
    if (value === null) {
      if (!this.map.has(name)) {
        return argMissing(`Missing required option "${name}".`);
      }
      return argInvalid(name, `Option "${name}" is not an integer.`);
    }
    return { ok: true, value };
  }
}

/** Shorthand for {@link SlashArgs.fromContext}. */
export function slashArgsFromContext(ctx: CommandContext): SlashArgs {
  return SlashArgs.fromContext(ctx);
}

/** Prefix {@link Args} or slash {@link SlashArgs} based on command kind. */
export function argsForContext(ctx: CommandContext): Args | SlashArgs {
  if (ctx.kind === "slash") return SlashArgs.fromContext(ctx);
  return Args.fromContext(ctx);
}
