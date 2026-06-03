# Plugins & container

Phase 14 adds **`@stambha/plugins`** — Sapphire-style lifecycle hooks plus a shared **container** (logger, config, DI).

Core stays transport-free: `@stambha/core` exposes `PluginLifecycle`, `DefaultStambhaContainer`, and `ConsoleLogger`. The plugins package wires hooks and optional interaction helpers.

---

## Quick start

```ts
import { createStambhaBot } from "@stambha/core";
import { loadPieces } from "@stambha/loader";
import { attachPlugins, definePlugin, StambhaContainer } from "@stambha/plugins";

const container = new StambhaContainer({ config: { env: "dev" } });
const client = createStambhaBot({ container });

await attachPlugins(client, {
  plugins: [
    definePlugin("metrics", {
      postLoad: ({ client, container }) => {
        container.logger.info(`Commands: ${client.registries.commands.size}`);
      },
      postStart: ({ container }) => container.logger.info("Online"),
    }),
  ],
});

await loadPieces(client, { context: { client, vault } });
// postLoad runs automatically after loadPieces

client.setBridge(bridge);
await client.start(); // preStart → connect → postStart
```

---

## Lifecycle hooks

| Hook | When |
|------|------|
| `preInit` | First hook in `attachPlugins`, before services register |
| `postInit` | After container/logger are on `client.binder` |
| `postLoad` | After `loadPieces()` finishes (command index rebuilt) |
| `preStart` | Before `bridge.connect()` in `client.start()` |
| `postStart` | After `ready` is emitted |

Hook order for a typical bot:

```text
attachPlugins → preInit → postInit
loadPieces    → postLoad
client.start  → preStart → connect → postStart
```

---

## StambhaContainer

```ts
const container = new StambhaContainer({
  logger: myLogger, // optional; defaults to ConsoleLogger
  config: { apiUrl: process.env.API_URL },
});
```

- **`container.binder`** — same instance as `client.binder`
- **`container.logger`** — `debug`, `info`, `warn`, `error`
- **`container.config`** — frozen key/value map

### DI tokens

```ts
import { ContainerToken, LoggerToken } from "@stambha/plugins";

const logger = client.binder.resolve(LoggerToken);
const container = client.binder.resolve(ContainerToken);
```

Register your own services with `client.binder.registerSingleton(MyToken, instance)`.

---

## definePlugin vs class plugins

Use `definePlugin` for small hooks:

```ts
definePlugin("audit", {
  preStart: async ({ client }) => {
    client.on("commandError", ({ command, error }) => {
      // ...
    });
  },
});
```

For larger plugins, export a `StambhaPlugin` object with the same shape.

---

## Interaction routing (optional)

Bridges already route slash autocomplete and component signals. For custom tooling, use:

```ts
import { resolveInteractionTarget } from "@stambha/plugins";

const target = resolveInteractionTarget(client, {
  kind: "autocomplete",
  path: { root: "search", subcommand: "query" },
});

// or
resolveInteractionTarget(client, { kind: "signal", customId: "stambha:confirm:abc" });
```

- Autocomplete → `CommandIndex.resolveSlash`
- Signals → `Signal.parseCustomId` + signal registry

---

## Official extensions (separate repo)

**`@stambha/plugins` is the host** — hooks and DI only. Optional add-ons (dashboard HTTP, i18n, cron, etc.) live in a **separate monorepo**, same idea as [sapphiredev/plugins](https://github.com/sapphiredev/plugins):

- Planned org/repo: **`stambhadev/plugins`**
- Package names describe **capability**, not Sapphire’s `plugin-*` pattern

| Extension | Package |
|-----------|---------|
| Dashboard / OAuth / Vault HTTP | `@stambha/dashboard` |
| Translations | `@stambha/i18n` |
| Scheduled tasks | `@stambha/cron` |

Install from npm, register with `attachPlugins()` like any local plugin. See [ADR 003](/internal/adr/003-plugins-monorepo) (internal).

---

## Related

- [ROADMAP.md](./ROADMAP.md) — Phase 14
- [GATES.md](./GATES.md) — preconditions (often used inside plugins)
- [COMMAND_TREE.md](./COMMAND_TREE.md) — slash paths for autocomplete
