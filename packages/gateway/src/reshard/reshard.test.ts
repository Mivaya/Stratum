import { describe, expect, it, vi } from "vitest";
import {
  guildShardChanged,
  guildsAffectedByReshard,
  shardCapacityRatio,
} from "../shard/calculator.js";
import { createShardManager } from "../shard/ShardManager.js";
import { createIdentifyBudget } from "./IdentifyBudget.js";
import { evaluateReshard } from "./policy.js";
import { createReshardPlan } from "./plan.js";
import { createReshardController } from "./ReshardController.js";
import { createReshardServer } from "./createReshardServer.js";

describe("@stambha/gateway resharding", () => {
  it("evaluates scale-up when over threshold", () => {
    const eval_ = evaluateReshard(2500, 2);
    expect(eval_.needed).toBe(true);
    expect(eval_.reason).toBe("scale_up");
    expect(eval_.recommendedShards).toBe(3);
    expect(shardCapacityRatio(2500, 2)).toBeGreaterThan(0.8);
  });

  it("skips reshard when within capacity", () => {
    const eval_ = evaluateReshard(1500, 2);
    expect(eval_.needed).toBe(false);
    expect(eval_.recommendedShards).toBe(2);
  });

  it("lists guilds affected by reshard", () => {
    const guilds = ["100000000000000001", "100000000000000002"];
    const affected = guildsAffectedByReshard(2, 4, guilds);
    expect(affected.length).toBeGreaterThan(0);
    for (const id of affected) {
      expect(guildShardChanged(id, 2, 4)).toBe(true);
    }
  });

  it("builds reshard plan with identify order", () => {
    const plan = createReshardPlan({
      fromTotal: 2,
      toTotal: 4,
      guildIds: ["100000000000000001"],
    });
    expect(plan.identifyOrder).toEqual([0, 1, 2, 3]);
    expect(plan.fromTotal).toBe(2);
    expect(plan.toTotal).toBe(4);
  });

  it("spaces identify calls via budget", async () => {
    let time = 0;
    const sleep = vi.fn((ms: number) => {
      time += ms;
      return Promise.resolve();
    });

    const budget = createIdentifyBudget({
      minIntervalMs: 5500,
      maxConcurrent: 1,
      now: () => time,
      sleep,
    });

    await budget.acquire();
    budget.release();

    time = 100;
    await budget.acquire();

    expect(sleep).toHaveBeenCalledWith(5400);
  });

  it("runs controller identify flow and completes reshard", async () => {
    vi.useFakeTimers();
    const manager = createShardManager({ totalShards: 2 });
    const budget = createIdentifyBudget({
      minIntervalMs: 0,
      now: () => Date.now(),
      sleep: () => Promise.resolve(),
    });
    const controller = createReshardController({ manager, budget });

    controller.planManual(3);
    controller.start();

    const s0 = await controller.nextIdentify();
    expect(s0).toBe(0);
    controller.markIdentifyComplete(0, { sessionId: "a", sequence: 1 });

    const s1 = await controller.nextIdentify();
    expect(s1).toBe(1);
    controller.markIdentifyComplete(1, { sessionId: "b", sequence: 1 });

    const s2 = await controller.nextIdentify();
    expect(s2).toBe(2);
    controller.markIdentifyComplete(2, { sessionId: "c", sequence: 1 });

    expect(await controller.nextIdentify()).toBeNull();

    controller.complete();
    expect(manager.totalShards).toBe(3);
    expect(controller.status).toBe("complete");
    vi.useRealTimers();
  });

  it("resizes shard manager down", () => {
    const manager = createShardManager({ totalShards: 4 });
    manager.markReady(3, { sessionId: "x", sequence: 1 });
    manager.resize(2);
    expect(manager.totalShards).toBe(2);
    expect(manager.get(3)).toBeUndefined();
    expect(manager.get(0)).toBeDefined();
  });

  it("serves reshard HTTP API", async () => {
    const manager = createShardManager({ totalShards: 2 });
    const controller = createReshardController({ manager });
    const server = await createReshardServer({ port: 0, controller });

    const evaluate = await fetch(`${server.url}/v1/reshard/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildCount: 2500 }),
    });
    const evalBody = (await evaluate.json()) as { evaluation: { needed: boolean } };
    expect(evalBody.evaluation.needed).toBe(true);

    const planRes = await fetch(`${server.url}/v1/reshard/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetShards: 3 }),
    });
    const planBody = (await planRes.json()) as { plan: { toTotal: number } };
    expect(planBody.plan.toTotal).toBe(3);

    await server.close();
  });
});
