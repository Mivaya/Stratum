import { DefaultStratumContainer, type StratumLogger } from "@stratum/core";

export interface StratumContainerOptions {
  logger?: StratumLogger;
  /** Frozen config map (env, feature flags, etc.). */
  config?: Record<string, unknown>;
}

/** Logger + DI binder + optional config (Sapphire Container parity). */
export class StratumContainer extends DefaultStratumContainer {
  readonly config: Readonly<Record<string, unknown>>;

  constructor(options: StratumContainerOptions = {}) {
    super(options.logger);
    this.config = Object.freeze({ ...options.config });
  }
}
