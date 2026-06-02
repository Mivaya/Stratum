import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/**/*.test.ts"],
  format: ["esm"],
  dts: { entry: ["src/index.ts", "src/smoke.ts"] },
  sourcemap: true,
  clean: true,
  target: "es2022",
  /** Emit per-file ESM so `node:` imports survive for Deno `deno check`. */
  bundle: false,
});
