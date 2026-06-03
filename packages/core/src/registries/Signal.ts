import type { SignalContext } from "../context/SignalContext.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";

export type SignalType = "button" | "select" | "modal" | "autocomplete";

export interface SignalOptions extends UnitOptions {
  /** Which interaction types this signal handles */
  types?: SignalType[];
}

export abstract class Signal extends Unit<SignalOptions> {
  readonly types: SignalType[];

  constructor(registry: Registry<Signal>, options: SignalOptions) {
    super(registry, options);
    this.types = options.types ?? ["button"];
  }

  abstract run(ctx: SignalContext): Promise<void>;

  supports(type: SignalType): boolean {
    return this.types.includes(type);
  }

  /** Build a routable customId for Discord components */
  customId(suffix = ""): string {
    const base = `stambha:${this.name}`;
    return suffix ? `${base}:${suffix}` : base;
  }

  /** Parse stambha customId → signal name */
  static parseCustomId(customId: string): { name: string; suffix: string } | null {
    if (!customId.startsWith("stambha:")) return null;
    const parts = customId.split(":");
    const name = parts[1];
    if (!name) return null;
    return { name, suffix: parts.slice(2).join(":") };
  }
}
