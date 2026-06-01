# Stratum

A transport-agnostic Discord bot framework for Node.js and TypeScript.

## Packages

| Package | Description |
|---------|-------------|
| `@stratum/core` | Client, registries, pipeline, signals |
| `@stratum/bridge-discordjs` | discord.js bridge + slash deploy |
| `@stratum/bridge-discordeno` | Discordeno bridge (second transport) |
| `@stratum/metrics` | Prometheus metrics + `/metrics` HTTP server |
| `@stratum/vault` | Ledger / Blueprint / Record persistence |
| `@stratum/vault-sql` | SQLite + PostgreSQL drivers |
| `@stratum/loader` | Auto-load pieces from `src/commands/`, etc. |

Sequences guide: [docs/SEQUENCES.md](docs/SEQUENCES.md).

## Examples

| Example | Description |
|---------|-------------|
| `examples/minimal` | Mock bridge |
| `examples/discord-bot` | Full bot: loader + SQLite vault + signals |
| `examples/tier-split` | Split gateway + REST worker processes |
| `examples/discordeno-bot` | Discordeno transport + loader |

## Project layout

See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) and [docs/VAULT.md](docs/VAULT.md).

Roadmap: [docs/PHASES.md](docs/PHASES.md).

## Development

```bash
pnpm install
pnpm build
pnpm test
```

### Branch naming

`feature/{short-description}` — e.g. `feature/sequences`, `feature/tier-split`.

## Status

Phases 1–10 complete on `feature/metrics`.

Metrics guide: [docs/METRICS.md](docs/METRICS.md).
Discordeno bridge: [docs/BRIDGE_DISCORDENO.md](docs/BRIDGE_DISCORDENO.md).
Tier split guide: [docs/TIER_SPLIT.md](docs/TIER_SPLIT.md).
