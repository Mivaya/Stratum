# @stambha/core

**Transport-agnostic Discord bot framework** — client, command pipeline, registries, sequences, and tier split. No discord.js or Discordeno required.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha) · [Docs](https://github.com/mivaya/Stambha/tree/main/docs)

---

## Install

```bash
npm install @stambha/core
# or
pnpm add @stambha/core
```

Requires **Node.js 20+**.

Pair with `@stambha/rest`, `@stambha/gateway`, and `@stambha/transform` for a full native stack.

Works from **ESM** (`import`) and **CommonJS** (`require`) — the package ships dual builds (`dist/index.js` + `dist/index.cjs`).

```ts
import { Command, ok, type CommandContext, type Outcome, type Registry } from "@stambha/core";
```

`CommandContext`, `Outcome`, and other types should use `import type` when `verbatimModuleSyntax` is enabled.

---

## Quick start

```ts
import { Command, createStambhaBot, ok, type CommandContext, type Registry } from "@stambha/core";

class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, { name: "ping", description: "Pong!", kinds: ["prefix"] });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}

const client = createStambhaBot({ prefix: "!" });
client.register(new PingCommand(client.registries.commands));
await client.start();
```

For production wiring (REST + gateway), see [`examples/bot`](https://github.com/mivaya/Stambha/tree/main/examples/bot).

---

## Command pipeline

Inbound events flow through pieces in order:

```
Conduit → Barrier → Gate → Command → Epilogue
```

| Piece | Folder | Role |
|-------|--------|------|
| **Command** | `commands/` | Slash, prefix, context menu handlers |
| **Hook** | `listeners/` | Gateway event listeners |
| **Scout** | `scouts/` | Passive message watchers |
| **Barrier** | `barriers/` | Global command blockers |
| **Gate** | `gates/` | Per-command checks (Sapphire preconditions) |
| **Conduit** | `conduits/` | Middleware before gates |
| **Epilogue** | `epilogues/` | Post-command hooks |
| **Signal** | `signals/` | Buttons, selects, modals (`stambha:` ids) |
| **Chron** | `tasks/` | Cron scheduled jobs |

Auto-load folders with [`@stambha/loader`](../loader).

---

## Key exports

| Export | Purpose |
|--------|---------|
| `createStambhaBot`, `StambhaClient` | Bot client and lifecycle |
| `Command`, `Hook`, `Gate`, `Scout`, … | Piece base classes |
| `ExecutionPipeline` | Run conduit → command flow |
| `InboundRouter`, `SignalRouter` | Dispatch commands and components |
| `sequence`, `SequenceBuilder` | Multi-step UI flows |
| `RestPort`, `HttpRestPort` | Outbound API (tier split) |
| `MockBridge` | Testing without Discord |
| `ok`, `err`, `Outcome` | Typed command results |
| `Binder` | Lightweight DI |
| `resolveCommandGates` | Validate `gateNames` after `loadPieces` |

`Directive` is a deprecated alias for `Command`.

### Registry iteration

`Registry` is **not** iterable. List pieces with:

```ts
const commands = client.registries.commands.toArray();
// or: [...client.registries.commands.values()]
const ping = client.registries.commands.get("ping");
```

---

## Related packages

| Package | Use when |
|---------|----------|
| [`@stambha/rest`](../rest) | Native REST client and worker |
| [`@stambha/gateway`](../gateway) | Shard hub and event routing |
| [`@stambha/loader`](../loader) | Auto-load `src/commands/`, etc. |
| [`@stambha/gates`](../gates) | Built-in permission/cooldown gates |
| [`@stambha/plugins`](../plugins) | Plugin lifecycle hooks |

---

## Development

```bash
# from repo root
pnpm --filter @stambha/core build
pnpm --filter @stambha/core test
```

[Report issues](https://github.com/mivaya/Stambha/issues) · [CHANGELOG](https://github.com/mivaya/Stambha/blob/main/CHANGELOG.md)
