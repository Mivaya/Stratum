import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";

export interface HookOptions extends UnitOptions {
  /** Discord / bridge event name, e.g. "ready", "guildCreate". */
  event: string;
  once?: boolean;
}

/** Raw lifecycle handler bound to bridge events. */
export abstract class Hook extends Unit<HookOptions> {
  readonly event: string;
  readonly once: boolean;

  constructor(registry: Registry<Hook>, options: HookOptions) {
    super(registry, options);
    this.event = options.event;
    this.once = options.once ?? false;
  }

  abstract handle(payload: unknown): Promise<void> | void;
}
