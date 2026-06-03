# Publishing `@stambha/*` to npm

## Publish `@stambha/core` (first packages)

`@stambha/core` depends on **`@stambha/runtime`**. Publish in this order:

```bash
pnpm --filter @stambha/runtime build
pnpm --filter @stambha/core build

# Dry run
pnpm --filter @stambha/runtime publish --dry-run --no-git-checks
pnpm --filter @stambha/core publish --dry-run --no-git-checks

# Live (after npm login or NPM_TOKEN)
pnpm --filter @stambha/runtime publish --no-git-checks
pnpm --filter @stambha/core publish --no-git-checks
```

Ensure the **`stambha`** npm org exists and your user **`interittus13`** can publish to `@stambha/*`.

## One-time npm setup

1. Create an npm account and the **`@stambha`** org (or claim the scope) at [npmjs.com](https://www.npmjs.com/).
2. Create an **Automation** token (not Classic publish token with 2FA friction):
   - **Account → Access Tokens → Generate New Token → Granular**
   - Packages: read/write for `@stambha/*`
   - Or use **Automation** type for CI
3. In GitHub repo **Settings → Secrets and variables → Actions**:
   - Secret name: **`NPM_TOKEN`**
   - Value: the npm token
4. Optional: **Settings → Environments → New environment `npm`**
   - Add **Required reviewers** so publishes need approval before upload

## How the workflow runs

| Trigger | When | Result |
|---------|------|--------|
| **Release published** | You publish a GitHub Release (tag `v*`) | Publishes all `packages/*` to npm |
| **workflow_dispatch** | Actions → Publish npm → Run workflow | Default **dry run**; uncheck to publish |

- **Pre-release** on GitHub → npm dist-tag **`beta`**
- **Normal release** → dist-tag **`latest`**
- Skips `private` packages (root, `docs/`, `examples/`)

## Before each release

1. Bump versions in all `packages/*/package.json` (keep versions aligned).
2. Update `CHANGELOG.md`.
3. Merge to `main`, tag `v0.1.1`, publish GitHub Release.
4. **Publish npm** runs automatically (or run workflow manually with dry run first).

## Local dry run

```bash
pnpm build
pnpm -r publish --dry-run --access public --no-git-checks --filter './packages/*'
```

## Packages published (14)

`@stambha/core`, `transport`, `rest`, `gateway`, `transform`, `cache`, `loader`, `gates`, `args`, `plugins`, `vault`, `vault-sql`, `metrics`, `runtime`

## Troubleshooting

| Error | Fix |
|-------|-----|
| 403 Forbidden | Token lacks access to `@stambha` scope; verify org membership |
| Version already exists | Bump version in package.json before re-publishing |
| `workspace:*` in tarball | Run publish from CI after `pnpm install`; pnpm rewrites workspace refs |
| Org blocks third-party actions | Allow `actions/setup-node` in repo Actions settings |

## Trusted publishing (optional, no `NPM_TOKEN`)

npm supports [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) per package. For a 14-package monorepo, configure each package on npm or start with `NPM_TOKEN` and migrate later.
