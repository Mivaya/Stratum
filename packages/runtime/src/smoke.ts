import { basename, cwd, detectRuntime, env, join, randomUUID, resolve } from "./index.js";

const runtime = detectRuntime();
if (runtime === "unknown") {
  throw new Error("smoke: unknown runtime");
}

randomUUID();
join("src", "commands");
resolve("packages", "runtime");
basename("/tmp/foo.ts", ".ts");
cwd();
env("PATH");

console.log(`@stratum/runtime smoke ok (${runtime})`);
