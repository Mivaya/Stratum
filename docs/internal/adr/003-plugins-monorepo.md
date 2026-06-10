# ADR 003 — Official extensions in a separate monorepo

**Status:** Accepted  
**Date:** 2026-05-29

## Context

Sapphire maintains optional add-ons in a dedicated repository ([sapphiredev/plugins](https://github.com/sapphiredev/plugins)) while the framework lives in [sapphiredev/framework](https://github.com/sapphiredev/framework). Stambha should follow the same **split** without copying Sapphire’s **`plugin-*` package names**.

The main Stambha repo already ships **`@stambha/plugins`** — the **plugin host** (lifecycle hooks, `definePlugin`, `StambhaContainer`). That stays in core. Optional HTTP dashboards, i18n, cron, and similar capabilities belong in extensions.

## Decision

1. **Separate Git repository** for official Stambha extensions, modeled on [sapphiredev/plugins](https://github.com/sapphiredev/plugins):
   - Repo: **[`Mivaya/Stambha-plugins`](https://github.com/Mivaya/Stambha-plugins)** (local path: `Stambha-plugins`).
   - pnpm workspace; **[Changesets](https://github.com/changesets/changesets) independent versioning** per package.
   - CI: build, test, `changesets/action` publish to npm under `@stambha/*`.

2. **Naming rule — no Sapphire `plugin-*` mirror names.** Packages describe **capability**, not “plugin type”:

   | Sapphire (do not copy) | Stambha extension (plugins repo) |
   |------------------------|----------------------------------|
   | `@sapphire/plugin-api` | `@stambha/dashboard` |
   | `@sapphire/plugin-i18next` | `@stambha/i18n` |
   | `@sapphire/plugin-scheduled-tasks` | `@stambha/cron` |
   | `@sapphire/plugin-hmr` | `@stambha/dev-reload` |
   | `@sapphire/plugin-editable-commands` | `@stambha/editable-commands` |
   | `@sapphire/plugin-logger` | *(in core)* `@stambha/plugins` container + your logger |
   | `@sapphire/plugin-subcommands` | *(in core)* command tree |

3. **Integration contract:** Every extension is a normal Stambha plugin — `definePlugin()` from `@stambha/plugins`, peer dependency on `@stambha/core` (and other core packages as needed). No second plugin API.

4. **Main repo non-goals:** Do not add dashboard HTTP, i18n backends, or cron runners to `new-proj` long-term; link to the plugins monorepo from docs when packages exist.

5. **Moved to plugins repo (done):** `@stambha/cache`, `@stambha/metrics`, `@stambha/vault-sql` — source lives only in [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins).

## Consequences

- **Positive:** Smaller core repo; extensions release on their own cadence; clear boundary between framework and add-ons.
- **Positive:** Stambha-owned naming; no implied drop-in compatibility with `@sapphire/plugin-*`.
- **Negative:** Two repos to clone for full “batteries included” setup; docs must cross-link install paths.
- **Migration docs:** Sapphire `@sapphire/plugin-*` rows map to **Stambha core feature** or **`@stambha/<capability>`** from the plugins repo — never `@stambha/plugin-*`.

## Related

- [future-v2.md](../future-v2.md) — Pillar E (`@stambha/dashboard`)
- [roadmap.md](../roadmap.md) — Phase 14 plugin host vs extensions
- [features/plugins.md](../../features/plugins.md) — using `@stambha/plugins`
