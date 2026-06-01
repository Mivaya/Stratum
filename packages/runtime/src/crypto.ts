/** Generate a RFC 4122 UUID using the Web Crypto API (Node 20+, Bun, Deno). */
export function randomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  throw new Error("crypto.randomUUID is not available in this runtime");
}
