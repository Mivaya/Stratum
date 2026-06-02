export type RuntimeKind = "node" | "bun" | "deno" | "unknown";

declare const Bun: { version: string } | undefined;
declare const Deno: { version: { deno: string } } | undefined;

/** Detect the active JS runtime (Node.js, Bun, or Deno). */
export function detectRuntime(): RuntimeKind {
  if (typeof Bun !== "undefined") return "bun";
  if (typeof Deno !== "undefined") return "deno";
  if (typeof process !== "undefined" && process.versions?.node) return "node";
  return "unknown";
}

export function isNode(): boolean {
  return detectRuntime() === "node";
}

export function isBun(): boolean {
  return detectRuntime() === "bun";
}

export function isDeno(): boolean {
  return detectRuntime() === "deno";
}
