## Summary

<!-- What does this PR do? Link related issues: Fixes #123 -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (describe migration below)
- [ ] Documentation only
- [ ] Tests only
- [ ] Example / tooling

## Packages touched

- [ ] `@stratum/core`
- [ ] `@stratum/rest`
- [ ] `@stratum/gateway`
- [ ] `@stratum/transform`
- [ ] `@stratum/loader`
- [ ] `@stratum/vault`
- [ ] `@stratum/vault-sql`
- [ ] `@stratum/metrics`
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
- [ ] Core does not import discord.js or Discordeno (if touching `@stratum/core`)

## Test plan

<!-- How did you verify this? Steps for reviewers to reproduce. -->

```bash
# commands you ran, e.g.:
pnpm install
pnpm build
pnpm test
pnpm --filter @stratum/core test
```

## Screenshots / logs

<!-- Optional: metrics output, bot behavior, sequence flow, etc. -->
