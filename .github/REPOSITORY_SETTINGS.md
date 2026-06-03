# Repository settings (GitHub UI)

Quick checklist for **mivaya/Stratum**. Full org guide: [ORG_SECURITY.md](./ORG_SECURITY.md).

## Actions permissions

**Settings → Actions → General**

- Allow GitHub-owned actions (or allowlist — see ORG_SECURITY.md)
- Fork PRs: require approval for first-time contributors
- Workflow permissions: **Read** repository contents

## Pull requests

- Squash merge only; auto-delete head branches

## Branch protection (`main`)

- Require PR + status checks: `Node 20`, `Node 22`, `Bun`, `Deno`, `dependency-review`
- CODEOWNERS review required
- No force push; no bypass for admins (recommended)

## Code security

- Dependabot alerts + security updates
- Secret scanning + push protection
- Private vulnerability reporting

## GitHub Pages

**Source:** GitHub Actions → https://mivaya.github.io/Stratum/
