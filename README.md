# Stratum

A transport-agnostic Discord bot framework for Node.js and TypeScript.

## Packages

| Package | Description |
|---------|-------------|
| `@stratum/core` | Client, registries, execution pipeline, inbound router |
| `@stratum/bridge-discordjs` | discord.js bridge, attach helper, slash deploy API |
| `@stratum/vault` | Ledger, Blueprint, Record persistence |

## Examples

| Example | Description |
|---------|-------------|
| `examples/minimal` | Mock bridge, no Discord token |
| `examples/discord-bot` | Real bot with discord.js (`!ping` + `/ping`) |

See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for the Sapphire/Klasa-aligned folder layout (`src/commands/`, `src/listeners/`, etc.).

Vault guide: [docs/VAULT.md](docs/VAULT.md).

## Development

```bash
pnpm install
pnpm build
pnpm test
```

### Branch naming

Use **`feature/{short-description}`** for all feature work:

```bash
git checkout -b feature/bridge-discordjs
```

## Status

- **Phase 1** — `@stratum/core` (done)
- **Phase 2** — `@stratum/bridge-discordjs` (done)
- **Phase 3** — `@stratum/vault` (in progress on `feature/vault`)
