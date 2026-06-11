import { describe, expect, it } from "vitest";
import { StambhaClient } from "./StambhaClient.js";
import { Command, ok } from "../index.js";

class PingCommand extends Command {
  async execute() {
    return ok(undefined);
  }
}

describe("InboundRouter.parsePrefixCommand", () => {
  it("uses static prefix by default", async () => {
    const client = new StambhaClient({ prefix: "!" });
    client.register(new PingCommand(client.registries.commands, { name: "ping" }));

    const parsed = await client.router.parsePrefixCommand("!ping", { userId: "1" });
    expect(parsed).toEqual({ name: "ping", args: "" });
  });

  it("uses resolvePrefix when set", async () => {
    const client = new StambhaClient({
      prefix: "!",
      resolvePrefix: ({ guildId }) => (guildId === "guild-a" ? "?" : "!"),
    });
    client.register(new PingCommand(client.registries.commands, { name: "ping" }));

    expect(await client.router.parsePrefixCommand("?ping", { userId: "1", guildId: "guild-a" })).toEqual({
      name: "ping",
      args: "",
    });
    expect(await client.router.parsePrefixCommand("?ping", { userId: "1", guildId: "guild-b" })).toBeNull();
  });
});
