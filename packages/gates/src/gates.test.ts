import { describe, expect, it, vi } from "vitest";
import type { CommandContext } from "@stambha/core";
import { Permission, combinePermissions, hasPermissions } from "./permissions.js";
import { permissionsGate, userPermissionsGate } from "./permissionsGate.js";
import { cooldownGate } from "./cooldownGate.js";
import { MemoryCooldownStore } from "./cooldownStore.js";
import { nsfwGate } from "./nsfwGate.js";
import { guildOnlyGate, runInGate, RunIn } from "./runInGate.js";

function ctx(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    kind: "slash",
    commandName: "ping",
    userId: "user-1",
    guildId: "guild-1",
    channelId: "channel-1",
    raw: {},
    reply: vi.fn(),
    replyEphemeral: vi.fn(),
    ...overrides,
  };
}

describe("hasPermissions", () => {
  it("checks required bits", () => {
    const need = Permission.SendMessages | Permission.ViewChannel;
    expect(hasPermissions(Permission.SendMessages, need)).toBe(false);
    expect(hasPermissions(need, need)).toBe(true);
  });

  it("administrator bypasses checks", () => {
    expect(hasPermissions(Permission.Administrator, Permission.ManageGuild)).toBe(true);
  });
});

describe("permissionsGate", () => {
  it("denies when member lacks permissions", async () => {
    const gate = userPermissionsGate(Permission.ManageGuild);
    const result = await gate.check(
      ctx({ meta: { memberPermissions: Permission.SendMessages } }),
    );
    expect(result.allow).toBe(false);
  });

  it("allows when member has permissions", async () => {
    const gate = permissionsGate({
      user: combinePermissions(Permission.SendMessages, Permission.ViewChannel),
      client: Permission.SendMessages,
    });
    const result = await gate.check(
      ctx({
        meta: {
          memberPermissions: combinePermissions(Permission.SendMessages, Permission.ViewChannel),
          clientPermissions: Permission.SendMessages,
        },
      }),
    );
    expect(result.allow).toBe(true);
  });
});

describe("cooldownGate", () => {
  it("limits invocations per window", async () => {
    const store = new MemoryCooldownStore();
    const gate = cooldownGate({ limit: 2, delay: 60_000, store, scope: "user" });

    expect((await gate.check(ctx())).allow).toBe(true);
    expect((await gate.check(ctx())).allow).toBe(true);
    const denied = await gate.check(ctx());
    expect(denied.allow).toBe(false);
    expect(denied.reason).toContain("Slow down");
  });

  it("bypasses filtered users", async () => {
    const store = new MemoryCooldownStore();
    const gate = cooldownGate({
      limit: 1,
      delay: 60_000,
      store,
      filteredUsers: ["user-1"],
    });

    expect((await gate.check(ctx())).allow).toBe(true);
    expect((await gate.check(ctx())).allow).toBe(true);
  });
});

describe("nsfwGate", () => {
  it("denies in non-nsfw channels", async () => {
    const gate = nsfwGate();
    expect((await gate.check(ctx({ meta: { channelNsfw: false } }))).allow).toBe(false);
    expect((await gate.check(ctx({ meta: { channelNsfw: true } }))).allow).toBe(true);
  });
});

describe("runInGate", () => {
  it("allows matching channel types", async () => {
    const gate = runInGate(RunIn.GuildText);
    expect((await gate.check(ctx({ meta: { channelType: "guild_text" } }))).allow).toBe(true);
    expect((await gate.check(ctx({ meta: { channelType: "dm" } }))).allow).toBe(false);
  });

  it("guildOnlyGate rejects DMs", async () => {
    const gate = guildOnlyGate();
    expect((await gate.check(ctx({ meta: { channelType: "dm" } }))).allow).toBe(false);
    expect((await gate.check(ctx({ meta: { channelType: "guild_text" } }))).allow).toBe(true);
  });
});
