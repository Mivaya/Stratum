import { DefaultStambhaContainer, type StambhaLogger } from "@stambha/core";

export interface StambhaContainerOptions {
  logger?: StambhaLogger;
  /** Frozen config map (env, feature flags, etc.). */
  config?: Record<string, unknown>;
}

/** Logger + DI binder + optional config (Sapphire Container parity). */
export class StambhaContainer extends DefaultStambhaContainer {
  readonly config: Readonly<Record<string, unknown>>;

  constructor(options: StambhaContainerOptions = {}) {
    super(options.logger);
    this.config = Object.freeze({ ...options.config });
  }
}
