# Stratum roadmap

## Completed

| Phase | Branch | Package |
|-------|--------|---------|
| 1 Core | `main` / `feature/*` | `@stratum/core` |
| 2 Bridge | `feature/bridge-discordjs` | `@stratum/bridge-discordjs` |
| 3 Vault | `feature/vault` | `@stratum/vault` |
| 3b Vault SQL | `feature/vault-sql` | `@stratum/vault-sql` |
| 4 Piece loader | `feature/piece-loader` | `@stratum/loader` |
| 5 Signals | `feature/signal-registry` | `Signal` in core + bridge routing |
| 6 Sequences | `feature/sequences` | Multi-step flows (`sequence()`, `runSequence`) |
| 7 Chron | `feature/chron` | Scheduled tasks (`Chron`, `src/tasks/`) |
| 8 Tier split | `feature/tier-split` | REST / gateway workers (`RestPort`, split tier) |
| 9 Bridge Discordeno | `feature/bridge-discordeno` | `@stratum/bridge-discordeno` |
| 10 Metrics | `feature/metrics` | `@stratum/metrics` (Prometheus) |
| 11 Gates | `feature/gates` | `@stratum/gates` (cooldown, permissions, NSFW, RunIn) |
| 12 Args | `feature/args` | `@stratum/args` (prefix lexer + slash options) |
| 13 Command tree | `feature/command-tree` | Subcommands, aliases, autocomplete, deploy v2 |
| 14 Plugins | `feature/plugins` | `@stratum/plugins` (hooks, container, logger) |
| 15 Transport | `feature/transport` | `@stratum/transport`, `@stratum/rest` |

## Future (phases 16–21)

Full feature matrix, Sapphire + Discordeno parity plan, and Stratum originals: **[ROADMAP.md](./ROADMAP.md)**.

Summary:

| Phase | Focus | Inspired by |
|-------|--------|-------------|
| ~~11~~ | ~~Built-in gates (`@stratum/gates`)~~ | ~~Sapphire preconditions~~ **Done** |
| ~~12~~ | ~~Arguments (`@stratum/args`)~~ | ~~Sapphire ArgumentStore~~ **Done** |
| ~~13~~ | ~~Command tree & deploy~~ | ~~Sapphire commands~~ **Done** |
| ~~14~~ | ~~Plugins & container~~ | ~~Sapphire plugins~~ **Done** |
| ~~15~~ | ~~Transport foundation~~ | ~~Discordeno REST model~~ **Done** |
| 16–17 | Native REST worker + desired properties | Discordeno architecture |
| 17 | Desired properties & transformers | Discordeno memory model |
| 18–19 | Gateway, cache, resharding | Discordeno big bot |
| 20 | Cross-runtime (Node, Bun, Deno) | Discordeno |
| 21 | Migration docs | Stratum onboarding |

## Branch rule

Always use `feature/{short-name}`.
