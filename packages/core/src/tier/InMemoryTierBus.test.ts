import { describe, expect, it, vi } from "vitest";
import { InMemoryTierBus } from "./InMemoryTierBus.js";

describe("InMemoryTierBus", () => {
  it("delivers events to subscribers by type", () => {
    const bus = new InMemoryTierBus();
    const handler = vi.fn();
    bus.subscribe("ping", handler);

    bus.publish({ type: "ping", payload: { n: 1 }, timestamp: Date.now() });
    bus.publish({ type: "other", payload: null, timestamp: Date.now() });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]?.payload).toEqual({ n: 1 });
  });

  it("unsubscribes via returned disposer", () => {
    const bus = new InMemoryTierBus();
    const handler = vi.fn();
    const off = bus.subscribe("tick", handler);
    off();

    bus.publish({ type: "tick", payload: null, timestamp: Date.now() });
    expect(handler).not.toHaveBeenCalled();
  });
});
