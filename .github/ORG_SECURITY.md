# Mivaya org — Stambha security setup

Checklist for **mivaya/Stambha** after moving from a personal account. Repository files cover automation; org admins configure the rest in GitHub.

**Docs site:** https://mivaya.github.io/Stambha/

---

## 1. Organization settings (org owners)

**https://github.com/organizations/mivaya/settings**

| Setting | Location | Recommendation |
|---------|----------|----------------|
| **Two-factor authentication** | Security → Authentication | **Required** for all members |
| **Base permissions** | Member privileges | **Read** (not Write) — grant per-repo |
| **Repository creation** | Member privileges | Restrict who can create public repos |
| **Forking** | Member privileges | Allow for open source; review private fork policy |
| **Default repository visibility** | Member privileges | **Private** until ready to publish |

### Code security (org-wide defaults)

**Settings → Code security and analysis**

- Dependabot alerts: **Enabled** for all repos
- Dependabot security updates: **Enabled**
- Secret scanning: **Enabled**
- Push protection: **Enabled**
- Private vulnerability reporting: **Enabled** (repos inherit)

---

## 2. Team & access

Create a maintainers team:

1. **https://github.com/orgs/mivaya/teams/new**
2. Name: **`stambha-maintainers`** (must match [CODEOWNERS](./CODEOWNERS))
3. Add core maintainers; grant **Maintain** or **Admin** on `mivaya/Stambha`

Avoid giving **Write** on `main` to many members — use PRs + branch protection.

---

## 3. Repository settings (`mivaya/Stambha`)

### Actions permissions

**Settings → Actions → General**

Because the org may restrict third-party actions:

- **Allow all actions** (simplest), **or**
- Allowlist: `actions/*`, `pnpm/action-setup`, `oven-sh/setup-bun`, `denoland/setup-deno`

Also enable:

- **Fork PR workflows:** require approval for **first-time contributors**
- **Workflow permissions:** **Read** repository contents (workflows declare extra permissions where needed)

### Pull requests

**Settings → General → Pull Requests**

- Squash merge **on**; merge commits **off**
- **Delete head branch** after merge **on**
- **Allow updating pull request branches by maintainers** — **on** (required for [update-pr-branches.yml](./workflows/update-pr-branches.yml))

### Branch protection — `main`

**Settings → Branches → Add rule**

| Rule | Setting |
|------|---------|
| Require pull request | Yes — 1 approval (or 0 for solo + CI-only) |
| Require review from CODEOWNERS | Yes (after team exists) |
| Required status checks | `Node 20`, `Node 22`, `Bun`, `Deno`, `dependency-review` |
| Require branches up to date | Yes |
| Block force push | Yes |
| Restrict deletions | Yes |
| Do not allow bypassing | Yes (except break-glass admins) |

### Code security (repo)

Same as org defaults; confirm **Private vulnerability reporting** is **Enabled**.

### GitHub Pages

**Settings → Pages → Source:** **GitHub Actions**

---

## 4. What this repo automates (committed)

| File | Purpose |
|------|---------|
| [dependabot.yml](./dependabot.yml) | Weekly npm + GitHub Actions updates |
| [workflows/dependency-review.yml](./workflows/dependency-review.yml) | Block PRs introducing high-severity deps |
| [workflows/ci.yml](./workflows/ci.yml) | Build + test matrix |
| [workflows/update-pr-branches.yml](./workflows/update-pr-branches.yml) | Auto-merge `main` into open PR branches |
| [workflows/docs.yml](./workflows/docs.yml) | VitePress → GitHub Pages |
| [workflows/publish-npm.yml](./workflows/publish-npm.yml) | Publish `@stambha/*` on GitHub Release or `workflow_dispatch` |
| [PUBLISHING.md](./PUBLISHING.md) | npm token + release process |
| [CODEOWNERS](./CODEOWNERS) | `@mivaya/stambha-maintainers` on sensitive paths |
| [SECURITY.md](../SECURITY.md) | Vulnerability reporting |
| [pull_request_template.md](./pull_request_template.md) | PR checklist |

---

## 5. After transfer — verify

- [ ] Clone URL works: `git@github.com:mivaya/Stambha.git`
- [ ] CI green on `main`
- [ ] Docs deploy: **Actions → Docs**
- [ ] Pages live: https://mivaya.github.io/Stambha/
- [ ] CODEOWNERS team exists and gets review requests
- [ ] Dependabot opened at least one PR or shows enabled
- [ ] Secret scanning + push protection on
- [ ] npm scope `@stambha` publish credentials updated if publishing from org

---

## 6. Optional hardening

- **Rulesets** (org): org-wide branch protection for all `mivaya/*` repos
- **OIDC** for npm trusted publishing (no long-lived tokens in secrets)
- **CodeQL** workflow for JavaScript/TypeScript
- **Signed commits** required via branch protection
- **Custom domain** for docs (`docs.mivaya.dev`) — update VitePress `base` to `/`

See also [REPOSITORY_SETTINGS.md](./REPOSITORY_SETTINGS.md) for a short UI checklist.
