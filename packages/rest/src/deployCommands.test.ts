import { describe, expect, it } from "vitest";
import { Command, type Registry } from "@stambha/core";
import { deployCommands } from "./deployCommands.js";

class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, { name: "ping", description: "Pong", kinds: ["slash"] });
  }

  execute = async () => ({ ok: true as const, value: undefined });
}

describe("deployCommands", () => {
  it("dry-run returns payload count without network", async () => {
    const registry = { register: (c: Command) => c } as Registry<Command>;
    const ping = new PingCommand(registry);

    const result = await deployCommands({
      token: "test",
      applicationId: "app-1",
      commands: [ping],
      dryRun: true,
      diff: true,
    });

    expect(result.count).toBe(1);
    expect(result.global).toBe(true);
    expect(result.diff?.added).toContain("ping");
  });
});
