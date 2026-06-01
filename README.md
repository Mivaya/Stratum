# Stratum

**Native Discord bot framework for Node.js and TypeScript**

[![GitHub](https://img.shields.io/github/license/Interittus13/Stratum)](https://github.com/Interittus13/Stratum/blob/main/LICENSE)
[![Node](https://img.shields.io/node/v/@stratum/core?color=339933&logo=node.js)](https://nodejs.org)

Stratum is a **transport-agnostic** bot framework with a first-class **native stack** — your command pipeline, vault, and workers do not depend on discord.js or Discordeno. Folder layout follows [Sapphire](https://sapphirejs.dev/) conventions so teams migrating off Sapphire keep familiar `commands/`, `listeners/`, and `preconditions/` → `gates/` paths.

Legacy library bridges are **deprecated**; use `@stratum/rest`, `@stratum/gateway`, and `@stratum/transform` instead. See [docs/migration/](docs/migration/).

---

## Features

### Command pipeline

Piece-based architecture inspired by Sapphire — commands, hooks, middleware, and post-run epilogues in a predictable pipeline.

- **Commands** — slash, prefix, and context menu in one `Command` class
- **Hooks** — gateway event listeners (`src/listeners/`)
- **Scouts** — passive message watchers (`src/scouts/`)
- **Barriers** — global command blockers (`src/barriers/`)
- **Gates** — per-command checks, Sapphire precondition equivalent (`src/gates/`)
- **Conduits** — middleware before gates (`src/conduits/`)
- **Epilogues** — post-command hooks (`src/epilogues/`)
- **Signals** — buttons, selects, modals via `stratum:` custom ids
- **Chron** — cron scheduled tasks (`src/tasks/`)

Auto-load pieces from disk with `@stratum/loader`.

### Arguments (`@stratum/args`)

Typed prefix lexer and slash option parsing — Sapphire `ArgumentStore` equivalent without coupling to discord.js.

### Gates (`@stratum/gates`)

Built-in preconditions: cooldown, permissions, NSFW, RunIn, guild/DM-only. Attach to commands or register globally.

### Vault (`@stratum/vault`)

Schema-first guild, user, and channel settings — Blueprint + Ledger with optional SQLite/PostgreSQL drivers.

### Sequences

Multi-step flows with `sequence()` and `stratum:seq:` custom ids — wizards and confirmations without manual state machines.

### Native REST (`@stratum/rest`)

Discordeno-inspired centralized REST queue, rate-limit buckets, and split-tier REST worker. No discord.js in the REST process.

### Gateway & sharding (`@stratum/gateway`)

Shard manager, identify/resume payloads, identify budget, resharding policy, gateway↔bot worker bus, and `GatewayEventHub` for native WebSocket workers.

### Tier split

Run gateway, REST, and bot logic in separate processes — see [docs/deployment/tier-split.md](docs/deployment/tier-split.md) and `examples/bot` (`pnpm split:*`).

### Desired properties (`@stratum/transform`)

Slim command contexts and REST payloads — Discordeno-style memory control for large bots.

### Metrics (`@stratum/metrics`)

Prometheus counters and histograms with optional `/metrics` HTTP server.

### Cross-runtime (`@stratum/runtime`)

Shared abstractions for Node.js, Bun, and Deno (env, fs, paths, timers).

---

## How Stratum compares

| | [Sapphire](https://sapphirejs.dev/) | [Discordeno](https://discordeno.deno.dev/) | **Stratum** |
|---|:---:|:---:|:---:|
| Discord coupling | discord.js required | Low-level API | **Native transport** — no library bridge layer |
| Piece / command model | Built-in | Bring your own | **Sapphire-style folders** |
| Preconditions | `@sapphire/*` plugins | DIY | **`@stratum/gates`** |
| Settings | Plugins / manual | DIY | **Vault** |
| Gateway + REST split | Manual | Native | **`RestPort` + tier split v2** |
| Sharding / resharding | Manual | Built-in | **`@stratum/gateway`** |
| Multi-step UI | Plugins | DIY | **Sequences** |
| Observability | Community | DIY | **`@stratum/metrics`** |

---

## Architecture

```mermaid
flowchart TB
    subgraph Discord["Discord"]
        GW["Gateway WebSocket"]
        API["REST API"]
    end

    subgraph Native["Native transport"]
        GWH["GatewayEventHub"]
        REST["@stratum/rest"]
        TR["@stratum/transform"]
    end

    subgraph Core["@stratum/core"]
        IR["InboundRouter"]
        PL["Pipeline"]
    end

    GW --> GWH
    API <--> REST
    GWH --> TR --> IR --> PL
    REST --> PL
```

**Inbound:** your shard worker normalizes gateway payloads → `GatewayEventHub.emit` → `attachStratumClient` → pipeline.

**Outbound:** commands reply through `RestPort` (in-process `createNativeRestPort` or split-tier `HttpRestPort`).

---

## Installation

```sh
pnpm add @stratum/core @stratum/rest @stratum/gateway @stratum/transform @stratum/loader
```

Optional: `@stratum/vault`, `@stratum/vault-sql`, `@stratum/gates`, `@stratum/args`, `@stratum/metrics`, `@stratum/cache`.

Requires **Node.js 20+**.

---

## Quick start (native stack)

### 1. Command

```ts
// src/commands/General/PingCommand.ts
import { Command, ok, type CommandContext, type Registry } from "@stratum/core";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Replies with Pong!",
      kinds: ["prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
```

### 2. Bootstrap

```ts
// src/main.ts
import { createStratumBot } from "@stratum/core";
import { attachStratumClient, createGatewayEventHub } from "@stratum/gateway";
import { loadPieces } from "@stratum/loader";
import { createNativeRestPort } from "@stratum/rest";

const token = process.env.DISCORD_TOKEN!;
const client = createStratumBot({
  prefix: "!",
  restPort: createNativeRestPort(token),
});

await loadPieces(client);

const hub = createGatewayEventHub();
attachStratumClient(hub, client);
client.setBridge(hub);

hub.markReady({ user: { id: "YOUR_BOT_USER_ID" } });
await client.start();

// Your WebSocket shard worker feeds events, e.g.:
// hub.emit("messageCreate", { id, content, channelId, guildId, author: { id, bot: false } });
```

### 3. Tier split (production)

```bash
cd examples/bot
pnpm rest    # REST worker
pnpm bot     # bot worker
pnpm gateway # gateway relay (native hub)
```

---

## Project layout (Sapphire-aligned)

```text
src/
  commands/       # slash, prefix, context menu
  listeners/      # Hook pieces (Sapphire listeners)
  gates/          # Gate pieces (Sapphire preconditions)
  scouts/         # passive watchers
  barriers/       # global blockers
  epilogues/      # post-command hooks
  conduits/       # middleware
  signals/        # buttons, modals, selects
  tasks/          # Chron cron jobs
  schemas/        # Vault blueprints
  main.ts
```

Full mapping: [docs/guide/project-structure.md](docs/guide/project-structure.md).

---

## Packages

| Package | Description |
|---------|-------------|
| [`@stratum/core`](packages/core) | Client, pipeline, registries, sequences, chron |
| [`@stratum/rest`](packages/rest) | **Native REST** client + worker |
| [`@stratum/gateway`](packages/gateway) | **Native gateway** hub, sharding, worker bus |
| [`@stratum/transform`](packages/transform) | Payload normalization + REST contexts |
| [`@stratum/loader`](packages/loader) | Auto-load Sapphire-style folders |
| [`@stratum/gates`](packages/gates) | Built-in gates (Sapphire preconditions) |
| [`@stratum/args`](packages/args) | Argument parsing |
| [`@stratum/vault`](packages/vault) | Settings persistence |
| [`@stratum/metrics`](packages/metrics) | Prometheus metrics |
| [`@stratum/cache`](packages/cache) | Pluggable cache |
| [`@stratum/runtime`](packages/runtime) | Node / Bun / Deno helpers |

---

## Examples

| Example | Stack |
|---------|--------|
| [`examples/bot`](examples/bot) | Full Sapphire-style layout — commands, gates, vault, signals, … |
| [`examples/minimal`](examples/minimal) | MockBridge + unit-style invoke |

See [`examples/README.md`](examples/README.md) for run instructions.

---

## Documentation

**Community site:** run `pnpm docs:dev` and open the VitePress preview, or read markdown under [`docs/`](docs/).

Deploy to GitHub Pages: see [Hosting the docs](docs/guide/hosting-the-docs.md).

| Section | Topic |
|---------|-------|
| [Getting started](docs/guide/getting-started.md) | Install and first bot |
| [Features](docs/features/gates.md) | Gates, vault, sequences, … |
| [Deployment](docs/deployment/overview.md) | Tier split, gateway, metrics |
| [Migration](docs/migration/) | From Sapphire or Discordeno |

Contributor planning docs: [`docs/internal/`](docs/internal/).

---

## Development

```bash
git clone git@github.com:Interittus13/Stratum.git
cd Stratum
pnpm install
pnpm build
pnpm test
```

Branch naming: `feature/{short-description}`.

---

## Status

Early development (`0.0.1`). Native transport stack is the default; bridge packages are deprecated. API may change before `1.0.0`.
