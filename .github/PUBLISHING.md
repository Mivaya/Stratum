# Publishing `@stambha/*` to npm (core monorepo)

All publishable `@stambha/*` packages in this repo share **one version** (fixed versioning). Releases are **tag-driven** — same model as before Changesets, similar to [Sapphire’s `publish.yml`](https://github.com/sapphiredev/framework/blob/main/.github/workflows/publish.yml) (manual bump + publish, no version-bot PRs).

**Official extensions** (`@stambha/cache`, `@stambha/vault-sql`, `@stambha/metrics`, …) publish from [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins) with **independent** versions.

---

## Packages published from this repo

`@stambha/core`, `runtime`, `transport`, `rest`, `gateway`, `transform`, `loader`, `gates`, `args`, `plugins`, `vault`

---

## Maintainer release flow

```text
Merge feature PRs to main
       ↓
Bump versions + CHANGELOG.md on main (PR or direct commit)
       ↓
pnpm docs:archive <semver> $(git rev-parse HEAD)   # optional frozen docs snapshot
       ↓
git tag v<semver> && git push origin v<semver>
       ↓
GitHub Release (published)  →  publish-npm.yml  →  npm (latest or beta)
```

Workflow: [`.github/workflows/publish-npm.yml`](./workflows/publish-npm.yml)

- **Stable release** — normal GitHub Release → npm dist-tag `latest`
- **Pre-release** — check “pre-release” on GitHub → npm dist-tag `beta`
- **Manual** — Actions → **Publish npm** → workflow_dispatch (dry run default)

### Version bump (all packages)

```bash
pnpm version:bump 0.2.3
# edit CHANGELOG.md
git add -A && git commit -m "chore: release v0.2.3"
```

### Docs archive (version dropdown)

```bash
pnpm docs:archive 0.2.3 $(git rev-parse HEAD)
```

Commit `docs/versions/<semver>/` before tagging. See [`docs/scripts/README.md`](../docs/scripts/README.md).

### Tag + GitHub Release

```bash
git tag v0.2.3
git push origin v0.2.3
```

Create a **published** release on GitHub for that tag (title + notes from `CHANGELOG.md`). Publishing starts automatically.

### Local publish (emergency)

```bash
pnpm install
pnpm build
pnpm test
NPM_TOKEN=... pnpm publish:npm
```

---

## Contributor workflow

1. Make your code change — **no changeset file**.
2. Open a PR; maintainer updates `CHANGELOG.md` at release time.
3. Do not bump `package.json` versions in feature PRs unless asked.

---

## One-time npm setup

1. Create the **`@stambha`** npm org at [npmjs.com](https://www.npmjs.com/).
2. Create an **Automation** token with read/write for `@stambha/*`.
3. GitHub **Settings → Secrets → Actions**: secret **`NPM_TOKEN`**.
4. Optional: **Environment `npm`** with required reviewers before publish.

Every publishable package needs:

```json
"publishConfig": {
  "access": "public",
  "registry": "https://registry.npmjs.org"
}
```

---

## Local dry run

```bash
pnpm build
pnpm -r publish --dry-run --access public --no-git-checks --filter './packages/*'
```

---

## Troubleshooting

| Error / symptom | Fix |
|-----------------|-----|
| 403 Forbidden | Token lacks `@stambha` scope |
| E404 on scoped publish | Regenerate `NPM_TOKEN`; ensure org publish rights + `publishConfig.access: public` on each package |
| npm shows old version as default | `latest` only moves when publish **succeeds**. Check `npm view @stambha/<pkg> dist-tags` |
| Version already exists | Bump to a new semver; npm does not allow republishing the same version |
| Publish workflow did not run | Release must be **published** (not draft). Tag must match `package.json` versions |
| `workspace:*` in tarball | Publish from CI after `pnpm install` |
