import { Binder } from "../binder/Binder.js";
import { ConsoleLogger } from "./ConsoleLogger.js";
import type { StratumContainerLike, StratumLogger } from "./types.js";

/** Default container with console logger and {@link Binder}. */
export class DefaultStratumContainer implements StratumContainerLike {
  readonly binder = new Binder();
  readonly logger: StratumLogger;

  constructor(logger?: StratumLogger) {
    this.logger = logger ?? new ConsoleLogger();
  }
}
