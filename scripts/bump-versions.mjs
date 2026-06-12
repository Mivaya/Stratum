#!/usr/bin/env node
/**
 * Bump fixed monorepo version — root package.json + each publishable package under packages/.
 *
 * Usage: node scripts/bump-versions.mjs 0.2.3
 */
import fs from "node:fs";
import path from "node:path";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error("Usage: node scripts/bump-versions.mjs <semver>");
  process.exit(1);
}

const root = process.cwd();

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

const rootPkgPath = path.join(root, "package.json");
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));
rootPkg.version = version;
writeJson(rootPkgPath, rootPkg);
console.log(`bumped ${rootPkg.name} → ${version}`);

for (const dir of fs.readdirSync(path.join(root, "packages"))) {
  const pkgPath = path.join(root, "packages", dir, "package.json");
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.private) continue;
  pkg.version = version;
  writeJson(pkgPath, pkg);
  console.log(`bumped ${pkg.name} → ${version}`);
}
