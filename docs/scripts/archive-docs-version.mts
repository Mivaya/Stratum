#!/usr/bin/env node
/**
 * Snapshot public docs from a git tag into docs/versions/<semver>/ for VitePress versioning.
 *
 * Usage: node docs/scripts/archive-docs-version.mts 0.2.1 [v0.2.1]
 *
 * Run before each release after docs are final on the release tag/commit.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");

const version = process.argv[2];
const tag = process.argv[3] ?? `v${version}`;

if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error("Usage: archive-docs-version.mts <semver> [git-tag]");
  process.exit(1);
}

function git(cmd: string): string {
  return execSync(cmd, { cwd: path.resolve(docsRoot, ".."), encoding: "utf-8" }).trim();
}

const dest = path.join(docsRoot, "versions", version);
const files = git(`git ls-tree -r --name-only ${tag} docs/`)
  .split("\n")
  .filter(Boolean)
  .filter(
    (f) =>
      !f.includes("/internal/") &&
      !f.includes("/.vitepress/") &&
      !f.includes("/versions/") &&
      !f.includes("/scripts/") &&
      f !== "docs/package.json" &&
      f !== "docs/.gitignore",
  );

fs.rmSync(dest, { recursive: true, force: true });

for (const file of files) {
  const rel = file.replace(/^docs\//, "");
  if (!rel) continue;

  const content = git(`git show ${tag}:${file}`);
  const out = path.join(dest, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
}

const versionedSidebar = path.join(docsRoot, ".vitepress/sidebars/versioned", `${version}.json`);
if (!fs.existsSync(versionedSidebar)) {
  const mainSidebar = path.join(docsRoot, ".vitepress/sidebars/versioned", "0.2.1.json");
  if (fs.existsSync(mainSidebar)) {
    fs.copyFileSync(mainSidebar, versionedSidebar);
    console.warn(`Copied sidebar template → ${versionedSidebar} (review links for this version).`);
  } else {
    console.warn(`No sidebar at ${versionedSidebar} — add one before building archived docs.`);
  }
}

console.log(`Archived docs ${tag} → docs/versions/${version}/ (${files.length} files)`);
