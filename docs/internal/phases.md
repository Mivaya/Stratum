# Stratum roadmap

## Completed

| Phase | Branch | Package |
|-------|--------|---------|
| 1 Core | `main` / `feature/*` | `@stratum/core` |
| 2 Bridge | `feature/bridge-discordjs` | `@stratum/bridge-discordjs` *(removed)* |
| 3 Vault | `feature/vault` | `@stratum/vault` |
| 3b Vault SQL | `feature/vault-sql` | `@stratum/vault-sql` |
| 4 Piece loader | `feature/piece-loader` | `@stratum/loader` |
| 5 Signals | `feature/signal-registry` | `Signal` in core + bridge routing |
| 6 Sequences | `feature/sequences` | Multi-step flows (`sequence()`, `runSequence`) |
| 7 Chron | `feature/chron` | Scheduled tasks (`Chron`, `src/tasks/`) |
| 8 Tier split | `feature/tier-split` | REST / gateway workers (`RestPort`, split tier) |
| 9 Bridge Discordeno | `feature/bridge-discordeno` | `@stratum/bridge-discordeno` *(removed)* |
| 10 Metrics | `feature/metrics` | `@stratum/metrics` (Prometheus) |
| 11 Gates | `feature/gates` | `@stratum/gates` (cooldown, permissions, NSFW, RunIn) |
| 12 Args | `feature/args` | `@stratum/args` (prefix lexer + slash options) |
| 13 Command tree | `feature/command-tree` | Subcommands, aliases, autocomplete, deploy v2 |
| 14 Plugins | `feature/plugins` | `@stratum/plugins` (hooks, container, logger) |
| 15 Transport | `feature/transport` | `@stratum/transport`, `@stratum/rest` |
| 16 Native REST worker | `feature/native-rest` | `createNativeRestWorker`, REST metrics |
| 17 Desired properties | `feature/desired-properties` | `@stratum/transform`, context slimming |
| 18 Gateway & cache | `feature/gateway` | `@stratum/gateway`, `@stratum/cache`, tier split v2 |
| 19 Sharding & resharding | `feature/resharding` | Reshard policy, identify budget, operator HTTP API |
| 20 Cross-runtime | `feature/cross-runtime` | `@stratum/runtime`, CI matrix Node/Bun/Deno |
| 21 Migration docs | `feature/migration-docs` | Sapphire, Klasa, Discordeno guides + ADR |

## Roadmap complete

Phases 1–21 are implemented. See **[ROADMAP.md](./ROADMAP.md)** for the full feature matrix and ADRs.

## Branch rule

Always use `feature/{short-name}`.
