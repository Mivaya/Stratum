import { recommendedShardCount, shardCapacityRatio } from "../shard/calculator.js";

export interface ReshardPolicyOptions {
  /** Target guilds per shard (Discord recommends ~1000). */
  guildsPerShard?: number;
  /** Scale up when average load exceeds this fraction of `guildsPerShard` (default 0.8). */
  scaleUpThreshold?: number;
  /** Scale down when average load falls below this fraction (default 0.3). */
  scaleDownThreshold?: number;
}

export type ReshardReason = "scale_up" | "scale_down" | "none";

export interface ReshardEvaluation {
  readonly needed: boolean;
  readonly reason: ReshardReason;
  readonly currentShards: number;
  readonly recommendedShards: number;
  readonly capacityRatio: number;
}

const DEFAULT_SCALE_UP = 0.8;
const DEFAULT_SCALE_DOWN = 0.3;

function resolvePolicy(options?: ReshardPolicyOptions): Required<ReshardPolicyOptions> {
  return {
    guildsPerShard: options?.guildsPerShard ?? 1000,
    scaleUpThreshold: options?.scaleUpThreshold ?? DEFAULT_SCALE_UP,
    scaleDownThreshold: options?.scaleDownThreshold ?? DEFAULT_SCALE_DOWN,
  };
}

/**
 * Threshold-based reshard recommendation (Discordeno-style capacity planning).
 */
export function evaluateReshard(
  guildCount: number,
  currentShards: number,
  options?: ReshardPolicyOptions,
): ReshardEvaluation {
  const policy = resolvePolicy(options);
  const recommended = recommendedShardCount(guildCount, policy.guildsPerShard);
  const capacityRatio = shardCapacityRatio(guildCount, currentShards, policy.guildsPerShard);

  if (recommended > currentShards && capacityRatio >= policy.scaleUpThreshold) {
    return {
      needed: true,
      reason: "scale_up",
      currentShards,
      recommendedShards: recommended,
      capacityRatio,
    };
  }

  if (recommended < currentShards && capacityRatio <= policy.scaleDownThreshold) {
    return {
      needed: true,
      reason: "scale_down",
      currentShards,
      recommendedShards: recommended,
      capacityRatio,
    };
  }

  return {
    needed: false,
    reason: "none",
    currentShards,
    recommendedShards: currentShards,
    capacityRatio,
  };
}
