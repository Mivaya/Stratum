import { describe, expect, it } from "vitest";
import { Signal } from "./Signal.js";

describe("Signal.parseCustomId", () => {
  it("parses stambha-prefixed ids", () => {
    expect(Signal.parseCustomId("stambha:confirm:abc")).toEqual({
      name: "confirm",
      suffix: "abc",
    });
  });

  it("returns null for foreign ids", () => {
    expect(Signal.parseCustomId("other:confirm")).toBeNull();
  });
});
