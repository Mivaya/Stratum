# Stratum

A transport-agnostic Discord bot framework for Node.js and TypeScript.

## Packages

| Package | Description |
|---------|-------------|
| `@stratum/core` | Client, registries, pipeline, signals |
| `@stratum/bridge-discordjs` | discord.js bridge + slash deploy |
| `@stratum/vault` | Ledger / Blueprint / Record persistence |
| `@stratum/vault-sql` | SQLite + PostgreSQL drivers |
| `@stratum/loader` | Auto-load pieces from `src/commands/`, etc. |

## Examples

| Example | Description |
|---------|-------------|
| `examples/minimal` | Mock bridge |
| `examples/discord-bot` | Full bot: loader + SQLite vault + signals |

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

Phases 1–5 implemented on `feature/vault-sql` (vault SQL + loader + signals). Merge via PRs per branch as needed.
