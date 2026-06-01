import { describe, expect, it } from "vitest";
import { normalizeRoute, parseRouteKey } from "./routeKey.js";

describe("routeKey", () => {
  it("replaces snowflakes with :id", () => {
    expect(normalizeRoute("/channels/123456789012345678/messages")).toBe("/channels/:id/messages");
    expect(normalizeRoute("guilds/987654321098765432/channels")).toBe("/guilds/:id/channels");
  });

  it("builds route keys with method", () => {
    const key = parseRouteKey("/channels/123456789012345678/messages", "POST");
    expect(key.method).toBe("POST");
    expect(key.route).toBe("/channels/:id/messages");
  });
});
