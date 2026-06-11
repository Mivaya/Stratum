# Repository settings (GitHub UI)

Quick checklist for **mivaya/Stambha**. Full org guide: [ORG_SECURITY.md](./ORG_SECURITY.md).

## Actions permissions

**Settings → Actions → General**

- Allow GitHub-owned actions (or allowlist — see ORG_SECURITY.md)
- Fork PRs: require approval for first-time contributors
- Workflow permissions: **Read** repository contents

## Pull requests

**Settings → General → Pull Requests**

- Squash merge only; auto-delete head branches
- **Allow updating pull request branches by maintainers** — **On** (enables the Update branch button and [update-pr-branches.yml](./workflows/update-pr-branches.yml))
- **Always suggest updating pull request branches** — **On** (optional; shows when a PR is behind `main`)

### Auto-sync PR branches (committed)

Workflow **[update-pr-branches.yml](./workflows/update-pr-branches.yml)** runs when:

1. **`main` is pushed** — merges latest `main` into every open same-repo PR (like clicking Update branch for each).
2. **A PR is opened or marked ready** — syncs that branch if it was created from stale `main`.

Fork PRs cannot be updated by Actions (GitHub cannot push to a contributor fork). Those authors should run:

```bash
git fetch upstream && git rebase upstream/main && git push --force-with-lease
```

**Why you still see “out of date” briefly:** branch protection requires PRs to be up to date before merge. After `main` moves, open PRs are behind until this workflow finishes (usually under a minute). Refresh the PR page once **Update PR branches** completes.

## Branch protection (`main`)

- Require PR + status checks: `Node 20`, `Node 22`, `Bun`, `Deno`, `dependency-review`
- CODEOWNERS review required
- No force push; no bypass for admins (recommended)

## Code security

- Dependabot alerts + security updates
- Secret scanning + push protection
- Private vulnerability reporting

## GitHub Pages

**Source:** GitHub Actions → https://mivaya.github.io/Stambha/
