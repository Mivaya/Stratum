# Changesets

This monorepo uses [Changesets](https://github.com/changesets/changesets) with **fixed versioning**: every `@stambha/*` package in the core repo shares one version.

## Adding a changeset

After your PR changes publishable packages:

```bash
pnpm changeset
```

Choose bump type (patch / minor / major) and write a short summary for the changelog.

## Release flow (maintainers)

1. Merge PRs with changeset files under `.changeset/`.
2. The **Release** workflow opens or updates a **Version packages** PR that bumps all fixed packages and updates `CHANGELOG.md`.
3. Merge the Version packages PR → workflow publishes to npm (`latest` or `beta` for prereleases).

See [.github/PUBLISHING.md](../.github/PUBLISHING.md).
