import { describe, expect, it, vi } from "vitest";
import { StratumClient } from "../client/StratumClient.js";
import { Directive } from "../registries/Directive.js";
import { Barrier } from "../registries/Barrier.js";
import { Epilogue } from "../registries/Epilogue.js";
import { ok } from "../outcome/Outcome.js";
import type { DirectiveContext } from "../context/types.js";
import { isOk } from "../outcome/Outcome.js";

function mockCtx(overrides: Partial<DirectiveContext> = {}): DirectiveContext {
  return {
    kind: "slash",
    directiveName: "ping",
    userId: "1",
    guildId: "2",
    channelId: "3",
    raw: {},
    reply: vi.fn().mockResolvedValue(undefined),
    replyEphemeral: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

class PingDirective extends Directive {
  execute = vi.fn(async (ctx: DirectiveContext) => {
    await ctx.reply("Pong!");
    return ok("pong");
  });
}

class BlockAllBarrier extends Barrier {
  block = vi.fn(async () => ({ block: true, reason: "Maintenance" }));
}

class AuditEpilogue extends Epilogue {
  run = vi.fn(async () => {});
}

describe("ExecutionPipeline", () => {
  it("runs directive when barriers pass", async () => {
    const client = new StratumClient();
    const registry = client.registries.directives;
    const ping = new PingDirective(registry, { name: "ping" });
    client.register(ping);

    const outcome = await client.invoke("ping", mockCtx());
    expect(isOk(outcome)).toBe(true);
    expect(ping.execute).toHaveBeenCalledOnce();
  });

  it("blocks directive when barrier returns block", async () => {
    const client = new StratumClient();
    const barrier = new BlockAllBarrier(client.registries.barriers, { name: "maintenance" });
    client.registries.barriers.register(barrier);

    const ping = new PingDirective(client.registries.directives, { name: "ping" });
    client.register(ping);

    const outcome = await client.invoke("ping", mockCtx());
    expect(isOk(outcome)).toBe(false);
    expect(ping.execute).not.toHaveBeenCalled();
  });

  it("runs epilogue after successful directive", async () => {
    const client = new StratumClient();
    const audit = new AuditEpilogue(client.registries.epilogues, { name: "audit", runOn: "always" });
    client.registries.epilogues.register(audit);

    const ping = new PingDirective(client.registries.directives, { name: "ping" });
    client.register(ping);

    await client.invoke("ping", mockCtx());
    expect(audit.run).toHaveBeenCalledOnce();
  });
});
