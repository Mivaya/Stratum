# Pieces & pipeline

Stambha organizes bot logic into **pieces** — classes registered in registries and executed through a shared pipeline. If you know Sapphire, this maps closely to commands, listeners, and preconditions.

## Execution order

```text
Gateway event → InboundRouter → Conduits → Barriers → Gates → Command → Epilogues
```

| Piece | Folder | Sapphire equivalent | Purpose |
|-------|--------|---------------------|---------|
| **Command** | `src/commands/` | Command | Slash, prefix, context menu |
| **Hook** | `src/listeners/` | Listener | React to gateway events |
| **Scout** | `src/scouts/` | — | Passive message watchers |
| **Barrier** | `src/barriers/` | — | Global command blockers |
| **Gate** | `src/gates/` | Precondition | Per-command checks |
| **Conduit** | `src/conduits/` | — | Middleware before gates |
| **Epilogue** | `src/epilogues/` | — | Post-command hooks |
| **Signal** | `src/signals/` | Interaction handler | Buttons, selects, modals |
| **Chron** | `src/tasks/` | — | Scheduled cron jobs |

## Auto-loading

```ts
import { loadPieces } from "@stambha/loader";

await loadPieces(client, { context: { client, vault } });
```

Defaults match `PiecePaths` in `@stambha/core` (`src/commands`, `src/listeners`, etc.).

## Manual registration

```ts
client.register(new PingCommand(client.registries.commands));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));
```

## Related guides

- [Arguments](/features/args)
- [Command tree](/features/command-tree)
- [Gates](/features/gates)
- [Plugins](/features/plugins)
- [Sequences](/features/sequences)