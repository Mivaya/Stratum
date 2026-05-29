import { type Outcome, ok, err } from "../outcome/Outcome.js";
import type { DirectiveContext } from "../context/types.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";

export interface GateResult {
  allow: boolean;
  reason?: string;
  silent?: boolean;
}

export interface GateLike {
  readonly name: string;
  check(ctx: DirectiveContext): Promise<GateResult>;
}

export interface GateOptions extends UnitOptions {
  priority?: number;
}

export abstract class Gate extends Unit<GateOptions> implements GateLike {
  readonly priority: number;

  constructor(registry: Registry<Gate>, options: GateOptions) {
    super(registry, options);
    this.priority = options.priority ?? 100;
  }

  abstract check(ctx: DirectiveContext): Promise<GateResult>;

  async evaluate(ctx: DirectiveContext): Promise<Outcome<void, GateDeniedError>> {
    const result = await this.check(ctx);
    if (result.allow) return ok(undefined);
    return err({
      message: result.reason ?? "Gate denied.",
      silent: result.silent ?? false,
      gate: this.name,
    });
  }
}

export interface GateDeniedError {
  message: string;
  silent: boolean;
  gate: string;
}

/** Inline gate without registry registration (for directive-level gates). */
export function defineGate(
  name: string,
  check: (ctx: DirectiveContext) => Promise<GateResult> | GateResult,
): GateLike {
  return {
    name,
    async check(ctx) {
      return check(ctx);
    },
  };
}

export function gateAnd(...gates: GateLike[]): GateLike {
  return defineGate(`and(${gates.map((g) => g.name).join(",")})`, async (ctx) => {
    for (const gate of gates) {
      const r = await gate.check(ctx);
      if (!r.allow) return r;
    }
    return { allow: true };
  });
}

export function gateOr(...gates: GateLike[]): GateLike {
  return defineGate(`or(${gates.map((g) => g.name).join(",")})`, async (ctx) => {
    for (const gate of gates) {
      const r = await gate.check(ctx);
      if (r.allow) return { allow: true };
    }
    return { allow: false, reason: "None of the required conditions were met." };
  });
}
