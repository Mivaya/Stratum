import { guildsAffectedByReshard } from "../shard/calculator.js";

export interface ReshardPlan {
  readonly fromTotal: number;
  readonly toTotal: number;
  /** Guild ids that move to a different shard index after the reshard. */
  readonly guildsToMigrate: readonly string[];
  /** Shard ids to identify in order (respect {@link IdentifyBudget}). */
  readonly identifyOrder: readonly number[];
}

export interface CreateReshardPlanOptions {
  fromTotal: number;
  toTotal: number;
  guildIds?: readonly string[];
}

export function createReshardPlan(options: CreateReshardPlanOptions): ReshardPlan {
  const { fromTotal, toTotal } = options;
  if (fromTotal < 1 || toTotal < 1) {
    throw new Error("fromTotal and toTotal must be >= 1");
  }

  const guildsToMigrate =
    options.guildIds !== undefined
      ? guildsAffectedByReshard(fromTotal, toTotal, options.guildIds)
      : [];

  const identifyOrder = Array.from({ length: toTotal }, (_, i) => i);

  return { fromTotal, toTotal, guildsToMigrate, identifyOrder };
}
