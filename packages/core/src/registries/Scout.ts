import type { ScoutContext, ScoutTrigger } from "../context/types.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";

export interface ScoutOptions extends UnitOptions {
  triggers?: ScoutTrigger[];
  ignoreBots?: boolean;
  ignoreSelf?: boolean;
  ignoreDMs?: boolean;
  priority?: number;
  concurrency?: "parallel" | "serial";
}

export abstract class Scout extends Unit<ScoutOptions> {
  readonly triggers: ScoutTrigger[];
  readonly ignoreBots: boolean;
  readonly ignoreSelf: boolean;
  readonly ignoreDMs: boolean;
  readonly priority: number;
  readonly concurrency: "parallel" | "serial";

  constructor(registry: Registry<Scout>, options: ScoutOptions) {
    super(registry, options);
    this.triggers = options.triggers ?? ["message"];
    this.ignoreBots = options.ignoreBots ?? true;
    this.ignoreSelf = options.ignoreSelf ?? true;
    this.ignoreDMs = options.ignoreDMs ?? false;
    this.priority = options.priority ?? 100;
    this.concurrency = options.concurrency ?? "parallel";
  }

  abstract run(ctx: ScoutContext): Promise<void>;

  shouldRun(ctx: ScoutContext, botUserId: string | null): boolean {
    if (!this.triggers.includes(ctx.trigger)) return false;
    if (this.ignoreDMs && !ctx.guildId) return false;
    if (this.ignoreBots && ctx.raw && isBotAuthor(ctx.raw)) return false;
    if (this.ignoreSelf && ctx.userId === botUserId) return false;
    return true;
  }
}

function isBotAuthor(raw: unknown): boolean {
  if (typeof raw !== "object" || raw === null) return false;
  const author = (raw as { author?: { bot?: boolean } }).author;
  return author?.bot === true;
}
