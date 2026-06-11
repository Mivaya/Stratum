# Publishing `@stambha/*` to npm (core monorepo)

The core repo uses **[Changesets](https://github.com/changesets/changesets)** with **fixed versioning**: all publishable `@stambha/*` packages share one version (e.g. `0.2.2`).

**Official extensions** (`@stambha/cache`, `@stambha/vault-sql`, `@stambha/metrics`, future `@stambha/dashboard`, …) move to the [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins) repo with **independent** Changesets versioning. See that repo’s `PUBLISHING.md`.

---

## Packages published from this repo

`@stambha/core`, `runtime`, `transport`, `rest`, `gateway`, `transform`, `loader`, `gates`, `args`, `plugins`, `vault`

`@stambha/cache`, `@stambha/metrics`, and `@stambha/vault-sql` publish from [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins) only.

---

## Contributor workflow

1. Make your code change.
2. Add a changeset:

   ```bash
   pnpm changeset
   ```

3. Open a PR (include the generated file under `.changeset/`).
4. Maintainers merge → **Release** workflow handles the rest.

---

## Maintainer release flow

```text
PR with changeset(s)  →  merge to main
       ↓
Release workflow runs changesets/action
       ↓
Opens/updates "Version packages" PR (bumps all fixed packages + CHANGELOG)
       ↓
Merge Version packages PR
       ↓
Archive docs snapshot: pnpm docs:archive <semver>  (commit docs/versions/<semver>/)
       ↓
Workflow publishes to npm (dist-tag latest, or beta for prerelease)
```

Workflow: [`.github/workflows/release.yml`](./workflows/release.yml)

**Docs:** `@stambha/docs` is not on npm. Versioned GitHub Pages use `docs/versions/<semver>/` — see [`docs/scripts/README.md`](../docs/scripts/README.md).

### Manual version bump (local)

```bash
pnpm changeset          # if not done in PR
pnpm version-packages   # bump package.json + CHANGELOG
pnpm release            # build + npm publish (needs npm auth)
```

---

## One-time npm setup

1. Create the **`@stambha`** npm org at [npmjs.com](https://www.npmjs.com/).
2. Create an **Automation** token with read/write for `@stambha/*`.
3. GitHub **Settings → Secrets → Actions**: secret **`NPM_TOKEN`**.
4. Optional: **Environment `npm`** with required reviewers before publish.

## Emergency manual publish

[`.github/workflows/publish-npm.yml`](./workflows/publish-npm.yml) — `workflow_dispatch` only, after versions are already bumped via Changesets.

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
| E404 on scoped publish | Regenerate `NPM_TOKEN`; ensure org publish rights. Every `packages/*/package.json` needs `"publishConfig": { "access": "public" }` — scoped packages default to **restricted** without it |
| npm shows old version as default | `latest` only moves when publish **succeeds** for that package. Check `npm view @stambha/<pkg> dist-tags`. Partial failed releases leave some packages on `0.2.0` while others reach `0.2.1` |
| Version already exists | Run `pnpm changeset` + merge Version PR with a new bump |
| No Version PR opened | Ensure `.changeset/*.md` files exist on `main` |
| `workspace:*` in tarball | Publish from CI after `pnpm install` |

Every publishable package must include:

```json
"publishConfig": {
  "access": "public",
  "registry": "https://registry.npmjs.org"
}
```

Changesets `"access": "public"` in `.changeset/config.json` is not always enough for `pnpm`/`npm` publish paths — keep `publishConfig` on each package.

## Trusted publishing (optional)

[npm OIDC trusted publishers](https://docs.npmjs.com/trusted-publishers) per package — configure on npm or use `NPM_TOKEN` initially.
