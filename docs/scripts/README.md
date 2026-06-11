# Docs scripts

## `archive-docs-version.mts`

Snapshots public docs from a git tag into `docs/versions/<semver>/` for the VitePress version switcher.

```bash
pnpm docs:archive 0.2.1
pnpm docs:archive 0.2.1 v0.2.1
```

Also add or update `docs/.vitepress/sidebars/versioned/<semver>.json`. Commit the archive with the release PR.

See [hosting-the-docs.md](../guide/hosting-the-docs.md#versioned-documentation).
