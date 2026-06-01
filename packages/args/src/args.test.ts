import { describe, expect, it } from "vitest";
import { Args } from "./Args.js";
import { SlashArgs } from "./SlashArgs.js";
import { tokenize } from "./lexer.js";
import { integerArg, stringArg } from "./resolvers.js";
import { unwrapArg } from "./errors.js";
import type { CommandContext } from "@stratum/core";

describe("tokenize", () => {
  it("splits on whitespace", () => {
    expect(tokenize("hello world")).toEqual(["hello", "world"]);
  });

  it("respects double quotes", () => {
    expect(tokenize('say "hello world" now')).toEqual(["say", "hello world", "now"]);
  });

  it("respects single quotes", () => {
    expect(tokenize("it's fine")).toEqual(["it's", "fine"]);
  });
});

describe("Args", () => {
  it("picks typed arguments", () => {
    const args = Args.fromText("42 hello");
    expect(unwrapArg(args.pick(integerArg))).toBe(42);
    expect(unwrapArg(args.pick(stringArg))).toBe("hello");
    expect(args.finished).toBe(true);
  });

  it("returns rest", () => {
    const args = Args.fromText("one two three");
    args.pick(stringArg);
    expect(args.rest()).toBe("two three");
    expect(unwrapArg(args.pickRest())).toBe("two three");
  });

  it("maybe returns null when empty", () => {
    const args = Args.fromText("");
    const result = args.maybeType("string");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeNull();
  });

  it("reads from context argsText", () => {
    const ctx: CommandContext = {
      kind: "prefix",
      commandName: "echo",
      userId: "1",
      guildId: "2",
      channelId: "3",
      argsText: "test",
      raw: {},
      reply: async () => {},
      replyEphemeral: async () => {},
    };
    expect(unwrapArg(Args.fromContext(ctx).pick(stringArg))).toBe("test");
  });
});

describe("SlashArgs", () => {
  it("reads slash options", () => {
    const args = new SlashArgs([
      { name: "value", type: "string", value: "!" },
      { name: "count", type: "integer", value: 3 },
    ]);
    expect(args.getString("value")).toBe("!");
    expect(args.getInteger("count")).toBe(3);
    expect(args.getString("missing")).toBeNull();
  });

  it("requireString fails when missing", () => {
    const args = new SlashArgs([]);
    const result = args.requireString("value");
    expect(result.ok).toBe(false);
  });
});
