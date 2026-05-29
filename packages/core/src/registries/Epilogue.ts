import type { EpilogueContext } from "../context/types.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";

export type EpilogueRunOn = "success" | "failure" | "always";

export interface EpilogueOptions extends UnitOptions {
  runOn?: EpilogueRunOn;
  priority?: number;
}

export abstract class Epilogue extends Unit<EpilogueOptions> {
  readonly runOn: EpilogueRunOn;
  readonly priority: number;

  constructor(registry: Registry<Epilogue>, options: EpilogueOptions) {
    super(registry, options);
    this.runOn = options.runOn ?? "success";
    this.priority = options.priority ?? 100;
  }

  abstract run(ctx: EpilogueContext): Promise<void>;

  matches(outcomeOk: boolean): boolean {
    if (this.runOn === "always") return true;
    if (this.runOn === "success") return outcomeOk;
    return !outcomeOk;
  }
}
