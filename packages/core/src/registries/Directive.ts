import { type Outcome, ok } from "../outcome/Outcome.js";
import type { DirectiveContext, DirectiveKind } from "../context/types.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";
import type { GateLike } from "./Gate.js";

export interface DirectiveOptions extends UnitOptions {
  description?: string;
  kinds?: DirectiveKind[];
  gates?: GateLike[];
}

export abstract class Directive extends Unit<DirectiveOptions> {
  readonly description: string;
  readonly kinds: DirectiveKind[];
  readonly gates: GateLike[];

  constructor(registry: Registry<Directive>, options: DirectiveOptions) {
    super(registry, options);
    this.description = options.description ?? "";
    this.kinds = options.kinds ?? ["slash"];
    this.gates = options.gates ?? [];
  }

  abstract execute(ctx: DirectiveContext): Promise<Outcome<unknown>>;

  supports(kind: DirectiveKind): boolean {
    return this.kinds.includes(kind);
  }

  /** Convenience wrapper when execute returns void on success. */
  protected success(): Outcome<void> {
    return ok(undefined);
  }
}
