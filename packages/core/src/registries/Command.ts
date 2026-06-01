import { type Outcome, ok } from "../outcome/Outcome.js";
import type { CommandContext, CommandKind } from "../context/types.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";
import type { GateLike } from "./Gate.js";

export interface CommandOptions extends UnitOptions {
  description?: string;
  kinds?: CommandKind[];
  gates?: GateLike[];
}

/** User-facing command piece (Sapphire/Klasa: `commands/` folder). */
export abstract class Command extends Unit<CommandOptions> {
  readonly description: string;
  readonly kinds: CommandKind[];
  readonly gates: GateLike[];

  constructor(registry: Registry<Command>, options: CommandOptions) {
    super(registry, options);
    this.description = options.description ?? "";
    this.kinds = options.kinds ?? ["slash"];
    this.gates = options.gates ?? [];
  }

  abstract execute(ctx: CommandContext): Promise<Outcome<unknown>>;

  supports(kind: CommandKind): boolean {
    return this.kinds.includes(kind);
  }

  protected success(): Outcome<void> {
    return ok(undefined);
  }
}
