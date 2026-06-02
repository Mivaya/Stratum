import { describe, expect, it } from "vitest";
import { resolveDesiredProperties, slimCommandContext, slimMeta } from "@stratum/core";
import { gatesDesiredProperties } from "@stratum/core";
import { buildDiscordenoDesiredProperties, metaFromDiscordenoSlash } from "./discordeno.js";
import { interactionReplyBody } from "./rest.js";

describe("@stratum/transform", () => {
  it("builds discordeno desired properties with member when permissions wanted", () => {
    const resolved = resolveDesiredProperties(gatesDesiredProperties);
    const props = buildDiscordenoDesiredProperties(resolved);
    expect((props.interaction as Record<string, boolean>).member).toBe(true);
  });

  it("maps discordeno interaction permissions to meta", () => {
    const meta = metaFromDiscordenoSlash({
      guildId: 1n,
      member: { permissions: 8n },
    });
    expect(meta?.memberPermissions).toBe(8n);
  });

  it("builds interaction reply REST body", () => {
    expect(interactionReplyBody("hi", true)).toEqual({
      type: 4,
      data: { content: "hi", flags: 64 },
    });
  });

  it("slims via core helper", () => {
    const desired = resolveDesiredProperties(gatesDesiredProperties);
    const slim = slimCommandContext(
      {
        kind: "prefix",
        commandName: "ping",
        userId: "1",
        guildId: null,
        channelId: "2",
        meta: { channelType: "dm", memberPermissions: 1n, clientPermissions: 2n },
        raw: {},
        reply: async () => {},
        replyEphemeral: async () => {},
      },
      desired,
    );
    expect(slim.raw).toBe(null);
    expect(slimMeta(slim.meta, desired.meta)).toEqual({ channelType: "dm", memberPermissions: 1n, clientPermissions: 2n });
  });
});
