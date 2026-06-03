import { Binder } from "../binder/Binder.js";
import { ConsoleLogger } from "./ConsoleLogger.js";
import type { StambhaContainerLike, StambhaLogger } from "./types.js";

/** Default container with console logger and {@link Binder}. */
export class DefaultStambhaContainer implements StambhaContainerLike {
  readonly binder = new Binder();
  readonly logger: StambhaLogger;

  constructor(logger?: StambhaLogger) {
    this.logger = logger ?? new ConsoleLogger();
  }
}
