import { detectRuntime } from "./detect.js";

declare const Deno: { env: { get(name: string): string | undefined }; cwd(): string } | undefined;

/** Read an environment variable in a runtime-agnostic way. */
export function env(name: string): string | undefined {
  const runtime = detectRuntime();
  if (runtime === "deno") {
    return Deno!.env.get(name);
  }
  return process.env[name];
}

/** Current working directory. */
export function cwd(): string {
  const runtime = detectRuntime();
  if (runtime === "deno") {
    return Deno!.cwd();
  }
  return process.cwd();
}
