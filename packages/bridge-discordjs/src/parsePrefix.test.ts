import { describe, expect, it } from "vitest";
import { StratumClient } from "@stratum/core";

describe("InboundRouter.parsePrefixCommand", () => {
  it("parses name and respects prefix", () => {
    const client = new StratumClient({ prefix: "!" });
    expect(client.router.parsePrefixCommand("!ping")).toEqual({ name: "ping", args: "" });
    expect(client.router.parsePrefixCommand("!ping hello")).toEqual({ name: "ping", args: "hello" });
    expect(client.router.parsePrefixCommand("?ping")).toBeNull();
  });
});
