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

## Branch rule

Always use `feature/{short-name}`.
