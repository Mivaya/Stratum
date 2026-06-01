import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node20",
  external: ["@discordeno/bot", "@stratum/core", "@stratum/transform"],
});
