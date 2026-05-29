import { describe, expect, it } from "vitest";
import { err, isErr, isOk, ok } from "./Outcome.js";

describe("Outcome", () => {
  it("ok carries value", () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toBe(42);
  });

  it("err carries error", () => {
    const result = err("fail");
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error).toBe("fail");
  });
});
