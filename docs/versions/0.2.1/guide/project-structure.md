# Project structure

Stambha bots use **Sapphire-aligned folders** so teams migrating from Sapphire keep familiar paths.

## Recommended layout

```text
src/
  commands/           # slash, prefix, context menu
    General/
      PingCommand.ts
  listeners/          # Hook pieces (Sapphire listeners)
    ReadyListener.ts
  scouts/             # passive message watchers
  barriers/           # global command blockers
  gates/              # per-command checks (Sapphire preconditions)
  epilogues/          # post-command hooks
  conduits/           # middleware before gates
  signals/            # buttons, modals, selects
  tasks/              # Chron scheduled jobs
  schemas/            # Vault blueprints
  main.ts
```

## Auto-load pieces

```ts
import { loadPieces } from "@stambha/loader";

await loadPieces(client, { context: { client, vault } });
```

Pieces with extra dependencies can expose `static create(ctx: LoaderContext)`.

## Sapphire mapping

| Folder | Sapphire | Stambha class |
|--------|----------|---------------|
| `commands/` | commands | `Command` |
| `listeners/` | listeners | `Hook` |
| `gates/` | preconditions | `Gate` |

`PiecePaths` in `@stambha/core` lists default paths (`PiecePaths.commands === "src/commands"`, `PiecePaths.preconditions === "src/gates"`).

## Manual registration

```ts
client.register(new PingCommand(client.registries.commands));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));
```

See [`examples/bot`](../../examples/bot) for a complete native bot using auto-load.

## Next

- [Pieces & pipeline](/guide/pieces)
- [Getting started](/guide/getting-started)