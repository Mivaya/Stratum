import { describe, expect, it } from "vitest";
import { SequenceStore } from "./SequenceStore.js";

describe("SequenceStore", () => {
  it("resolves waitForStep when completeStep is called", async () => {
    const store = new SequenceStore();
    const session = store.createSession({
      userId: "u1",
      guildId: "g1",
      channelId: "c1",
      timeoutMs: 5000,
    });

    const wait = store.waitForStep(session.id, "pick", 5000);
    const status = store.completeStep(session.id, "pick", "u1", "yes");
    expect(status).toBe("ok");
    await expect(wait).resolves.toBe("yes");
  });

  it("rejects wrong user", () => {
    const store = new SequenceStore();
    const session = store.createSession({
      userId: "u1",
      guildId: null,
      channelId: "c1",
      timeoutMs: 5000,
    });

    expect(store.completeStep(session.id, "pick", "u2", "yes")).toBe("wrong_user");
  });
});
