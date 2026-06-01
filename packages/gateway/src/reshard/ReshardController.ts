import type { ShardManager } from "../shard/ShardManager.js";
import type { IdentifyBudget } from "./IdentifyBudget.js";
import { createIdentifyBudget } from "./IdentifyBudget.js";
import { createReshardPlan, type ReshardPlan } from "./plan.js";
import { evaluateReshard, type ReshardEvaluation, type ReshardPolicyOptions } from "./policy.js";

export type ReshardPhase = "idle" | "planned" | "identifying" | "complete";

export interface ReshardControllerOptions {
  manager: ShardManager;
  budget?: IdentifyBudget;
  policy?: ReshardPolicyOptions;
  /** Guild ids used to compute migration sets (optional). */
  getGuildIds?: () => readonly string[];
}

/**
 * Operator-facing resharding state machine — plan, stagger identifies, resize shards.
 */
export class ReshardController {
  private readonly manager: ShardManager;
  private readonly budget: IdentifyBudget;
  private readonly policy: ReshardPolicyOptions | undefined;
  private readonly getGuildIds: () => readonly string[];

  private phase: ReshardPhase = "idle";
  private activePlan: ReshardPlan | null = null;
  private identifyCursor = 0;

  constructor(options: ReshardControllerOptions) {
    this.manager = options.manager;
    this.budget = options.budget ?? createIdentifyBudget();
    this.policy = options.policy;
    this.getGuildIds = options.getGuildIds ?? (() => []);
  }

  get status(): ReshardPhase {
    return this.phase;
  }

  get plan(): ReshardPlan | null {
    return this.activePlan;
  }

  get totalShards(): number {
    return this.manager.totalShards;
  }

  /** Automated threshold check (does not start migration). */
  evaluate(guildCount: number): ReshardEvaluation {
    return evaluateReshard(guildCount, this.manager.totalShards, this.policy);
  }

  /** Build a migration plan without starting it. */
  planManual(targetShards: number): ReshardPlan {
    const plan = createReshardPlan({
      fromTotal: this.manager.totalShards,
      toTotal: targetShards,
      guildIds: this.getGuildIds(),
    });
    this.activePlan = plan;
    this.identifyCursor = 0;
    this.phase = "planned";
    return plan;
  }

  /** Start executing a plan (manual or from {@link planManual}). */
  start(plan?: ReshardPlan): ReshardPlan {
    const next = plan ?? this.activePlan;
    if (!next) throw new Error("No reshard plan; call planManual() first");
    this.activePlan = next;
    this.identifyCursor = 0;
    if (next.toTotal > this.manager.totalShards) {
      this.manager.resize(next.toTotal);
    }
    this.phase = "identifying";
    return next;
  }

  /**
   * Identify the next shard in the plan, respecting the identify budget.
   * Returns shard id, or `null` when all shards are identified.
   */
  async nextIdentify(): Promise<number | null> {
    const plan = this.activePlan;
    if (!plan || this.phase !== "identifying") {
      throw new Error("Reshard not in identifying phase");
    }

    if (this.identifyCursor >= plan.identifyOrder.length) {
      return null;
    }

    await this.budget.acquire();
    const shardId = plan.identifyOrder[this.identifyCursor]!;
    this.identifyCursor++;
    this.manager.markIdentifying(shardId);
    return shardId;
  }

  /** Call after a shard finishes identify (success or failure). */
  markIdentifyComplete(shardId: number, session?: { sessionId: string; sequence: number }): void {
    this.budget.release();
    if (session) {
      this.manager.markReady(shardId, session);
    } else {
      this.manager.markDisconnected(shardId);
    }
  }

  /** Apply new shard count and finish the reshard. */
  complete(): void {
    const plan = this.activePlan;
    if (!plan) throw new Error("No active reshard plan");
    this.manager.resize(plan.toTotal);
    this.phase = "complete";
    this.activePlan = null;
    this.identifyCursor = 0;
  }

  reset(): void {
    this.phase = "idle";
    this.activePlan = null;
    this.identifyCursor = 0;
  }
}

export function createReshardController(options: ReshardControllerOptions): ReshardController {
  return new ReshardController(options);
}
