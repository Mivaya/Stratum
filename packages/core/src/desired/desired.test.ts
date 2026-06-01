import { describe, expect, it } from "vitest";
import type { CommandContext } from "../context/types.js";
import { gatesDesiredProperties, minimalDesiredProperties, resolveDesiredProperties } from "./DesiredProperties.js";
import { slimCommandContext, slimMeta } from "./slimContext.js";

function baseCtx(): CommandContext {
  return {
    kind: "slash",
    commandName: "ping",
    userId: "1",
    guildId: "2",
    channelId: "3",
    meta: {
      channelType: "guild_text",
      channelNsfw: false,
      memberPermissions: 8n,
      clientPermissions: 16n,
    },
    slashOptions: [{ name: "q", type: 3, value: "hi" }],
    slashPath: { root: "ping" },
    raw: { big: true },
    reply: async () => {},
    replyEphemeral: async () => {},
  };
}

describe("desired properties", () => {
  it("resolves overrides", () => {
    const r = resolveDesiredProperties(minimalDesiredProperties);
    expect(r.context.raw).toBe(false);
    expect(r.context.meta).toBe(false);
  });

  it("slims meta fields", () => {
    const meta = slimMeta(baseCtx().meta, { channelType: true, channelNsfw: false, memberPermissions: false, clientPermissions: false });
    expect(meta).toEqual({ channelType: "guild_text" });
  });

  it("slims command context", () => {
    const desired = resolveDesiredProperties(gatesDesiredProperties);
    const slim = slimCommandContext(baseCtx(), desired);
    expect(slim.raw).toBe(null);
    expect(slim.meta?.memberPermissions).toBe(8n);
    expect(slim.slashPath).toEqual({ root: "ping" });
  });
});
