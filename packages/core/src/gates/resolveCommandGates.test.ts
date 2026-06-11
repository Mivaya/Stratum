import { describe, expect, it, vi } from "vitest";
import { StambhaClient } from "../client/StambhaClient.js";
import { Command } from "../registries/Command.js";
import { Gate, defineGate } from "../registries/Gate.js";
import type { CommandContext } from "../context/types.js";
import { ok } from "../outcome/Outcome.js";
import { commandGatesForRun } from "./resolveCommandGates.js";

function mockCtx(): CommandContext {
  return {
    kind: "slash",
    commandName: "ping",
    userId: "1",
    channelId: "2",
    raw: {},
    reply: vi.fn(),
    replyEphemeral: vi.fn(),
  };
}

class PingCommand extends Command {
  async execute() {
    return ok(undefined);
  }
}

class ModOnlyGate extends Gate {
  check = vi.fn(async () => ({ allow: false, reason: "Mod only" }));
}

class GlobalSlowdown extends Gate {
  check = vi.fn(async () => ({ allow: false, reason: "Slow down" }));
}

describe("resolveCommandGates", () => {
  it("does not run registry gates unless gateNames or global", async () => {
    const client = new StambhaClient();
    const modGate = new ModOnlyGate(client.registries.gates, { name: "mod-only" });
    client.registries.gates.register(modGate);

    const ping = new PingCommand(client.registries.commands, { name: "ping" });
    client.register(ping);

    expect(commandGatesForRun(client, ping)).toEqual([]);

    const outcome = await client.invoke("ping", mockCtx());
    expect(outcome.ok).toBe(true);
    expect(modGate.check).not.toHaveBeenCalled();
  });

  it("runs gates listed in gateNames", async () => {
    const client = new StambhaClient();
    const modGate = new ModOnlyGate(client.registries.gates, { name: "mod-only" });
    client.registries.gates.register(modGate);

    const ping = new PingCommand(client.registries.commands, {
      name: "ping",
      gateNames: ["mod-only"],
    });
    client.register(ping);

    const outcome = await client.invoke("ping", mockCtx());
    expect(outcome.ok).toBe(false);
    expect(modGate.check).toHaveBeenCalledOnce();
  });

  it("runs global gates on every command", async () => {
    const client = new StambhaClient();
    const globalGate = new GlobalSlowdown(client.registries.gates, {
      name: "global-slowdown",
      global: true,
    });
    client.registries.gates.register(globalGate);

    const ping = new PingCommand(client.registries.commands, { name: "ping" });
    client.register(ping);

    const outcome = await client.invoke("ping", mockCtx());
    expect(outcome.ok).toBe(false);
    expect(globalGate.check).toHaveBeenCalledOnce();
  });

  it("merges global, gateNames, and inline gates in order", () => {
    const client = new StambhaClient();
    const globalGate = new GlobalSlowdown(client.registries.gates, {
      name: "global",
      global: true,
    });
    const namedGate = new ModOnlyGate(client.registries.gates, { name: "mod-only" });
    client.registries.gates.register(globalGate);
    client.registries.gates.register(namedGate);

    const inline = defineGate("inline", async () => ({ allow: true }));
    const ping = new PingCommand(client.registries.commands, {
      name: "ping",
      gateNames: ["mod-only"],
      gates: [inline],
    });
    client.register(ping);

    const names = commandGatesForRun(client, ping).map((g) => g.name);
    expect(names).toEqual(["global", "mod-only", "inline"]);
  });
});
