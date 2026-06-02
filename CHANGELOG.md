# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-29

First public release of the **native Stratum stack** — a transport-agnostic Discord bot framework with Sapphire-style ergonomics and Discordeno-inspired scale.

### Added

#### Core framework (`@stratum/core`)

- Piece-based command pipeline: Commands, Hooks, Scouts, Barriers, Conduits, Epilogues
- Typed outcome model (`ok` / `err`) through the execution pipeline
- Signal registry for buttons, selects, and modals (`stratum:` custom ids)
- Multi-step **Sequences** (`sequence()`, `runSequence`, `stratum:seq:` routing)
- **Chron** scheduled tasks with `src/tasks/` piece loading
- Tier-split hooks: `RestPort`, worker bus, gateway relay attachment points
- Global **Barrier** inhibitors and command error events

#### Native transport

- **`@stratum/transport`** — shared Discord wire types, rate-limit bucket model, session info
- **`@stratum/rest`** — centralized REST queue, rate-limit handling, `deployCommands`, `createNativeRestWorker`
- **`@stratum/gateway`** — shard manager, identify/resume payloads, identify budget, resharding policy, operator HTTP API, gateway↔bot worker bus, `GatewayEventHub`
- **`@stratum/transform`** — desired-properties trimming and optional Discord shape helpers
- **`@stratum/cache`** — pluggable in-memory cache (Redis driver planned for v2)

#### Developer experience

- **`@stratum/loader`** — auto-load pieces from disk (`commands/`, `listeners/`, `gates/`, …)
- **`@stratum/gates`** — cooldown, user/client permissions, NSFW, RunIn, guild/DM-only gates
- **`@stratum/args`** — prefix lexer and slash option parsing
- Slash **command tree** — subcommands, groups, aliases, autocomplete, deploy diff
- **`@stratum/plugins`** — lifecycle hooks (`preInit`, `postLoad`, …) and `StratumContainer` DI
- **`@stratum/vault`** — schema-first settings with Blueprint, Ledger, and Record
- **`@stratum/vault-sql`** — SQLite (`node:sqlite`, Node ≥ 22.5) and PostgreSQL drivers
- **`@stratum/metrics`** — Prometheus counters/histograms and optional `/metrics` server
- **`@stratum/runtime`** — portable env, fs, path, and timer helpers (Node, Bun, Deno)

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

- **Native stack is the default path** — connect via `@stratum/rest`, `@stratum/gateway`, and `@stratum/transform` instead of library bridges
- Bridge packages removed from the monorepo; `deployCommands` lives in `@stratum/rest`
- README and package metadata updated for the native-first story

### Removed

- **`@stratum/bridge-discordjs`** and **`@stratum/bridge-discordeno`** — see [ADR 002](docs/internal/adr/002-bridge-deprecation.md)
- Deprecated examples (`discord-bot`, `discordeno-bot`, `tier-split`, `split-native`) replaced by `examples/bot` and `examples/minimal`

### Known limitations (0.1.x)

- No bundled dashboard HTTP API — planned as `@stratum/dashboard` in a separate plugins monorepo
- Command **declarative options** (Sapphire-style cooldown/permission fields on `Command`) are manual via gates today; planned for v2
- **`@stratum/vault-sql` (SQLite)** requires Node **≥ 22.5**; tests skip on Node 20
- Public API may still change before **1.0.0** — pin semver ranges accordingly

### Packages in this release

| Package | Version |
|---------|---------|
| `@stratum/core` | 0.1.0 |
| `@stratum/transport` | 0.1.0 |
| `@stratum/rest` | 0.1.0 |
| `@stratum/gateway` | 0.1.0 |
| `@stratum/transform` | 0.1.0 |
| `@stratum/cache` | 0.1.0 |
| `@stratum/loader` | 0.1.0 |
| `@stratum/gates` | 0.1.0 |
| `@stratum/args` | 0.1.0 |
| `@stratum/plugins` | 0.1.0 |
| `@stratum/vault` | 0.1.0 |
| `@stratum/vault-sql` | 0.1.0 |
| `@stratum/metrics` | 0.1.0 |
| `@stratum/runtime` | 0.1.0 |

[0.1.0]: https://github.com/Interittus13/Stratum/releases/tag/v0.1.0
