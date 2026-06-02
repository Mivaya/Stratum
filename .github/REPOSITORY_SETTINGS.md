# Repository settings (GitHub UI)

Apply these in **Settings** before or after making the repo public. Steps 8–9 from the pre-public checklist.

## Pull request merge (step 8)

**Settings → General → Pull Requests**

- [x] Allow squash merging
- [ ] Allow merge commits
- [ ] Allow rebase merging (optional)
- [x] Always suggest updating pull request branches
- [x] Automatically delete head branches

Default message: **Pull request title and description**.

## Actions — fork PRs (step 9)

**Settings → Actions → General**

- **Actions permissions:** Allow *Stratum* actions and reusable workflows
- **Fork pull request workflows:** Require approval for **first-time contributors** (or all outside collaborators)
- **Workflow permissions:** Read repository contents and packages permissions
- **Artifact and log retention:** 7–14 days

## Branch protection (recommended)

**Settings → Branches → Add rule for `main`**

- Require pull request before merging
- Require status checks: `Node 20`, `Node 22`, `Bun`, `Deno`
- Require branches to be up to date
- Do not allow bypassing (or limit bypass to admins only)
- Restrict force pushes and branch deletion

## Code security

**Settings → Code security and analysis**

- Dependabot alerts: **Enabled**
- Dependabot security updates: **Enabled**
- Secret scanning: **Enabled** (automatic on public repos)
- Private vulnerability reporting: **Enabled**

## GitHub Pages

**Settings → Pages → Source:** GitHub Actions

Site URL: `https://interittus13.github.io/Stratum/`
