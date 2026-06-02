# ADR 003 — Official extensions in a separate monorepo

**Status:** Accepted  
**Date:** 2026-05-29

## Context

Sapphire maintains optional add-ons in a dedicated repository ([sapphiredev/plugins](https://github.com/sapphiredev/plugins)) while the framework lives in [sapphiredev/framework](https://github.com/sapphiredev/framework). Stratum should follow the same **split** without copying Sapphire’s **`plugin-*` package names**.

The main Stratum repo already ships **`@stratum/plugins`** — the **plugin host** (lifecycle hooks, `definePlugin`, `StratumContainer`). That stays in core. Optional HTTP dashboards, i18n, cron, and similar capabilities belong in extensions.

## Decision

1. **Separate Git repository** for official Stratum extensions, modeled on [sapphiredev/plugins](https://github.com/sapphiredev/plugins):
   - Proposed org/repo: **`stratumdev/plugins`** (name TBD at repo creation).
   - Turborepo/pnpm workspace; each package versioned and published independently.
   - CI: build, test, publish to npm under the `@stratum` scope (or a dedicated scope if npm policy requires it).

2. **Naming rule — no Sapphire `plugin-*` mirror names.** Packages describe **capability**, not “plugin type”:

   | Sapphire (do not copy) | Stratum extension (plugins repo) |
   |------------------------|----------------------------------|
   | `@sapphire/plugin-api` | `@stratum/dashboard` |
   | `@sapphire/plugin-i18next` | `@stratum/i18n` |
   | `@sapphire/plugin-scheduled-tasks` | `@stratum/cron` |
   | `@sapphire/plugin-hmr` | `@stratum/dev-reload` |
   | `@sapphire/plugin-editable-commands` | `@stratum/editable-commands` |
   | `@sapphire/plugin-logger` | *(in core)* `@stratum/plugins` container + your logger |
   | `@sapphire/plugin-subcommands` | *(in core)* command tree |

3. **Integration contract:** Every extension is a normal Stratum plugin — `definePlugin()` from `@stratum/plugins`, peer dependency on `@stratum/core` (and other core packages as needed). No second plugin API.

4. **Main repo non-goals:** Do not add dashboard HTTP, i18n backends, or cron runners to `new-proj` long-term; link to the plugins monorepo from docs when packages exist.

## Consequences

- **Positive:** Smaller core repo; extensions release on their own cadence; clear boundary between framework and add-ons.
- **Positive:** Stratum-owned naming; no implied drop-in compatibility with `@sapphire/plugin-*`.
- **Negative:** Two repos to clone for full “batteries included” setup; docs must cross-link install paths.
- **Migration docs:** Sapphire `@sapphire/plugin-*` rows map to **Stratum core feature** or **`@stratum/<capability>`** from the plugins repo — never `@stratum/plugin-*`.

## Related

- [future-v2.md](../future-v2.md) — Pillar E (`@stratum/dashboard`)
- [roadmap.md](../roadmap.md) — Phase 14 plugin host vs extensions
- [features/plugins.md](../../features/plugins.md) — using `@stratum/plugins`
