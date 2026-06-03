# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-29

First public release of the **native Stambha stack** — a transport-agnostic Discord bot framework with Sapphire-style ergonomics and Discordeno-inspired scale.

### Added

#### Core framework (`@stambha/core`)

- Piece-based command pipeline: Commands, Hooks, Scouts, Barriers, Conduits, Epilogues
- Typed outcome model (`ok` / `err`) through the execution pipeline
- Signal registry for buttons, selects, and modals (`stambha:` custom ids)
- Multi-step **Sequences** (`sequence()`, `runSequence`, `stambha:seq:` routing)
- **Chron** scheduled tasks with `src/tasks/` piece loading
- Tier-split hooks: `RestPort`, worker bus, gateway relay attachment points
- Global **Barrier** inhibitors and command error events

#### Native transport

- **`@stambha/transport`** — shared Discord wire types, rate-limit bucket model, session info
- **`@stambha/rest`** — centralized REST queue, rate-limit handling, `deployCommands`, `createNativeRestWorker`
- **`@stambha/gateway`** — shard manager, identify/resume payloads, identify budget, resharding policy, operator HTTP API, gateway↔bot worker bus, `GatewayEventHub`
- **`@stambha/transform`** — desired-properties trimming and optional Discord shape helpers
- **`@stambha/cache`** — pluggable in-memory cache (Redis driver planned for v2)

#### Developer experience

- **`@stambha/loader`** — auto-load pieces from disk (`commands/`, `listeners/`, `gates/`, …)
- **`@stambha/gates`** — cooldown, user/client permissions, NSFW, RunIn, guild/DM-only gates
- **`@stambha/args`** — prefix lexer and slash option parsing
- Slash **command tree** — subcommands, groups, aliases, autocomplete, deploy diff
- **`@stambha/plugins`** — lifecycle hooks (`preInit`, `postLoad`, …) and `StambhaContainer` DI
- **`@stambha/vault`** — schema-first settings with Blueprint, Ledger, and Record
- **`@stambha/vault-sql`** — SQLite (`node:sqlite`, Node ≥ 22.5) and PostgreSQL drivers
- **`@stambha/metrics`** — Prometheus counters/histograms and optional `/metrics` server
- **`@stambha/runtime`** — portable env, fs, path, and timer helpers (Node, Bun, Deno)

#### Examples & documentation

- **`examples/bot`** — full Sapphire-style bot with tier-split scripts (`pnpm split:*`)
- **`examples/minimal`** — MockBridge smoke example
- VitePress docs site under `docs/` with migration guides (Sapphire, Discordeno, Klasa)
- Internal roadmap, ADRs, and v2 planning (`docs/internal/`)

#### Tooling

- CI matrix: Node 20 & 22, Bun, Deno
- Biome lint, Vitest across packages
- GitHub Pages workflow for documentation

### Changed

- **Native stack is the default path** — connect via `@stambha/rest`, `@stambha/gateway`, and `@stambha/transform` instead of library bridges
- Bridge packages removed from the monorepo; `deployCommands` lives in `@stambha/rest`
- README and package metadata updated for the native-first story

### Removed

- **`@stambha/bridge-discordjs`** and **`@stambha/bridge-discordeno`** — see [ADR 002](docs/internal/adr/002-bridge-deprecation.md)
- Deprecated examples (`discord-bot`, `discordeno-bot`, `tier-split`, `split-native`) replaced by `examples/bot` and `examples/minimal`

### Known limitations (0.1.x)

- No bundled dashboard HTTP API — planned as `@stambha/dashboard` in a separate plugins monorepo
- Command **declarative options** (Sapphire-style cooldown/permission fields on `Command`) are manual via gates today; planned for v2
- **`@stambha/vault-sql` (SQLite)** requires Node **≥ 22.5**; tests skip on Node 20
- Public API may still change before **1.0.0** — pin semver ranges accordingly

### Packages in this release

| Package | Version |
|---------|---------|
| `@stambha/core` | 0.1.0 |
| `@stambha/transport` | 0.1.0 |
| `@stambha/rest` | 0.1.0 |
| `@stambha/gateway` | 0.1.0 |
| `@stambha/transform` | 0.1.0 |
| `@stambha/cache` | 0.1.0 |
| `@stambha/loader` | 0.1.0 |
| `@stambha/gates` | 0.1.0 |
| `@stambha/args` | 0.1.0 |
| `@stambha/plugins` | 0.1.0 |
| `@stambha/vault` | 0.1.0 |
| `@stambha/vault-sql` | 0.1.0 |
| `@stambha/metrics` | 0.1.0 |
| `@stambha/runtime` | 0.1.0 |

[0.1.0]: https://github.com/mivaya/Stambha/releases/tag/v0.1.0
