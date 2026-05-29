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

## Next phases

| Phase | Branch | Scope |
|-------|--------|--------|
| 6 Sequences | `feature/sequences` | Multi-step interaction flows |
| 7 Chron | `feature/chron` | Scheduled tasks (Klasa tasks) |
| 8 Tier split | `feature/tier-split` | REST / gateway workers |
| 9 Bridge Discordeno | `feature/bridge-discordeno` | Second transport adapter |
| 10 Metrics | `feature/metrics` | Prometheus / observability extension |

## Branch rule

Always use `feature/{short-name}`.
