# @stambha/loader

**Auto-load bot pieces** from Sapphire/Klasa-style folders — `commands/`, `listeners/`, `gates/`, and more.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha) · [Project structure](https://github.com/mivaya/Stambha/tree/main/docs/guide/project-structure.md)

---

## Install

```bash
npm install @stambha/loader @stambha/core
```

Requires **Node.js 20+**.

---

## Quick start

```ts
import { createStambhaBot } from "@stambha/core";
import { loadPieces } from "@stambha/loader";

const client = createStambhaBot({ prefix: "!" });

// Loads gates before commands (for Command.gateNames) and validates gate names after scan.
const { loaded, errors } = await loadPieces(client, {
  basePath: process.cwd(),
  context: { client, vault },
});

console.log(loaded.commands); // ["src/commands/General/PingCommand.ts", …]

if (errors.length) {
  for (const { file, error } of errors) {
    console.error(file, error);
  }
}
```

Pieces are discovered recursively under each folder. Export a **default class** that extends the matching piece type (`Command`, `Hook`, `Gate`, …).

---

## Default folders

| Kind | Path | Piece class |
|------|------|-------------|
| `commands` | `src/commands/` | `Command` |
| `listeners` | `src/listeners/` | `Hook` |
| `scouts` | `src/scouts/` | `Scout` |
| `barriers` | `src/barriers/` | `Barrier` |
| `gates` | `src/gates/` | `Gate` |
| `conduits` | `src/conduits/` | `Conduit` |
| `epilogues` | `src/epilogues/` | `Epilogue` |
| `signals` | `src/signals/` | `Signal` |
| `tasks` | `src/tasks/` | `Chron` |

Override or disable paths:

```ts
await loadPieces(client, {
  paths: {
    commands: "src/cmds",
    tasks: false, // skip
  },
});
```

Paths align with `PiecePaths` from `@stambha/core`.

---

## Key exports

| Export | Purpose |
|--------|---------|
| `loadPieces` | Scan folders and register pieces |
| `LoadPiecesOptions` | `basePath`, `context`, `paths` |
| `LoadPiecesResult` | `loaded` map + `errors` |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | Piece base classes and registries |
| [`@stambha/vault`](../vault) | Pass `vault` in loader `context` |

---

## Development

```bash
pnpm --filter @stambha/loader build
pnpm --filter @stambha/loader test
```
