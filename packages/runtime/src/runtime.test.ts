import { describe, expect, it } from "vitest";
import { basename, extname, join, pathToFileURL, resolve } from "./path.js";
import { randomUUID } from "./crypto.js";
import { detectRuntime, isNode } from "./detect.js";
import { sleep } from "./timers.js";

describe("@stratum/runtime", () => {
  it("detects node in vitest", () => {
    expect(isNode()).toBe(true);
    expect(detectRuntime()).toBe("node");
  });

  it("generates UUIDs", () => {
    const id = randomUUID();
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("joins and resolves paths", () => {
    expect(join("src", "commands", "Ping.ts")).toBe("src/commands/Ping.ts");
    expect(basename("/a/b/c.ts", ".ts")).toBe("c");
    expect(extname("c.ts")).toBe(".ts");
    expect(resolve("/abs", "rel")).toMatch(/abs\/rel/);
  });

  it("converts paths to file URLs", () => {
    const url = pathToFileURL("/tmp/test.js");
    expect(url.protocol).toBe("file:");
    expect(url.pathname).toContain("test.js");
  });

  it("sleeps via timers", async () => {
    const start = Date.now();
    await sleep(10);
    expect(Date.now() - start).toBeGreaterThanOrEqual(5);
  });
});
