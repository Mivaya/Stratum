import { stambhaPackageConfig } from "../../tsup.package.ts";

export default stambhaPackageConfig({
  entry: ["src/**/*.ts", "!src/**/*.test.ts"],
  bundle: false,
  target: "es2022",
  dts: { entry: ["src/index.ts", "src/smoke.ts"] },
});
