import type { StambhaClient } from "../client/StambhaClient.js";
import type { Registry } from "./Registry.js";

export interface UnitOptions {
  /** Unique name within the registry. */
  name: string;
  /** When false, the unit is skipped by the execution pipeline. */
  enabled?: boolean;
}

export abstract class Unit<TOptions extends UnitOptions = UnitOptions> {
  readonly name: string;
  enabled: boolean;

  constructor(
    readonly registry: Registry<Unit>,
    options: TOptions,
  ) {
    this.name = options.name;
    this.enabled = options.enabled ?? true;
  }

  get client(): StambhaClient {
    return this.registry.client;
  }
}
