# Project structure (Sapphire + Klasa aligned)

Stratum bots use the same **folder names** as [Sapphire](https://sapphirejs.dev/) and [Klasa](https://github.com/dirigeants/klasa), with Stratum-specific pieces where those frameworks use different names.

## Recommended layout

```text
src/
  commands/           # Sapphire + Klasa — slash, prefix, context menu
    General/
      PingCommand.ts
  listeners/          # Sapphire — Klasa calls these "events"
    ReadyListener.ts
  scouts/             # Klasa "monitors" — passive message watchers
  barriers/           # Klasa "inhibitors" — global command blockers
  gates/              # Sapphire "preconditions" — per-command checks
  epilogues/          # Klasa "finalizers" — post-command hooks
  conduits/           # Middleware before barriers/gates
  signals/            # Buttons, modals, selects (future)
  tasks/              # Klasa scheduled tasks (Stratum: Chron, future)
  schemas/            # Vault blueprints (per-guild/user data shapes)
  main.ts
```

## Name mapping

| Folder | Sapphire | Klasa | Stratum class |
|--------|----------|-------|----------------|
| `commands/` | commands | commands | `Command` |
| `listeners/` | listeners | events | `Hook` |
| `scouts/` | — | monitors | `Scout` |
| `barriers/` | — | inhibitors | `Barrier` |
| `gates/` | preconditions | — | `Gate` |
| `epilogues/` | — | finalizers | `Epilogue` |

## Constants

`PiecePaths` in `@stratum/core` lists these defaults for a future auto-loader:

```ts
import { PiecePaths } from "@stratum/core";
// PiecePaths.commands === "src/commands"
```

## Registering pieces (manual, until loader lands)

```ts
client.register(new PingCommand(client.registries.commands));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));
```
