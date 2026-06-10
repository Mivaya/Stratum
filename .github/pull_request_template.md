## Summary

<!-- What does this PR do? Link related issues: Fixes #123 -->

<!-- Same-repo PRs: if GitHub shows "out of date", wait for the **Update PR branches** check or click **Update branch**. Fork PRs: rebase onto main locally. -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (describe migration below)
- [ ] Documentation only
- [ ] Tests only
- [ ] Example / tooling

## Packages touched

- [ ] `@stambha/core`
- [ ] `@stambha/rest`
- [ ] `@stambha/gateway`
- [ ] `@stambha/transform`
- [ ] `@stambha/loader`
- [ ] `@stambha/vault`
- [ ] `@stambha/vault-sql`
- [ ] `@stambha/metrics`
- [ ] Examples
- [ ] Docs / repo config

## Motivation

<!-- Why is this change needed? What problem does it solve for advanced bot authors? -->

## Implementation notes

<!-- Key design decisions. If this adds a bridge or changes the pipeline, explain transport boundaries. -->

## Breaking changes

<!-- If any, list them and how users should migrate. Write "None" if not applicable. -->

## Checklist

- [ ] `pnpm build` passes locally
- [ ] `pnpm test` passes locally (new/updated tests where behavior changed)
- [ ] `pnpm lint` passes locally
- [ ] `pnpm typecheck` passes locally
- [ ] Docs and/or examples updated (if user-facing)
- [ ] No secrets or environment files committed
- [ ] Core does not import discord.js or Discordeno (if touching `@stambha/core`)
- [ ] Workflow or `dependabot.yml` changes reviewed by `@mivaya/stambha-maintainers`

## Security (if touching `.github/`, deps, or auth)

- [ ] No hard-coded tokens, bot tokens, or private keys
- [ ] Third-party Actions are allowlisted for the Mivaya org
- [ ] Dependency changes pass **dependency-review** CI on the PR

## Test plan

<!-- How did you verify this? Steps for reviewers to reproduce. -->

```bash
# commands you ran, e.g.:
pnpm install
pnpm build
pnpm test
pnpm --filter @stambha/core test
```

## Screenshots / logs

<!-- Optional: metrics output, bot behavior, sequence flow, etc. -->
