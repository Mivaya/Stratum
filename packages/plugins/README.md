# @stambha/plugins

**Plugin lifecycle** — `definePlugin`, DI container, and Sapphire-style hooks around client startup and interactions.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

---

## Install

```bash
npm install @stambha/plugins @stambha/core
```

Requires **Node.js 20+**.

---

## Quick start

```ts
import { createStambhaBot } from "@stambha/core";
import { attachPlugins, definePlugin } from "@stambha/plugins";

const LoggingPlugin = definePlugin("logging", {
  postStart: async () => {
    console.log("[plugin:logging] client started");
  },
});

const client = createStambhaBot({ /* … */ });

await attachPlugins(client, {
  plugins: [LoggingPlugin],
});
```

Plugins receive a `PluginContext` with `client`, `logger`, and the `StambhaContainer` for services.

---

## Container & tokens

```ts
import { StambhaContainer, ContainerToken, LoggerToken } from "@stambha/plugins";

const container = new StambhaContainer();
container.register(LoggerToken, () => myLogger);
```

---

## Key exports

| Export | Purpose |
|--------|---------|
| `definePlugin` | Declare a plugin module |
| `attachPlugins` | Register plugins on a client |
| `PluginManager`, `createPluginManager` | Ordered load/unload |
| `StambhaContainer` | Lightweight service container |
| `resolveSignal`, `resolveAutocompleteCommand` | Interaction routing helpers |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | Client events and lifecycle |
| [`@stambha/loader`](../loader) | Load local plugins from disk |

See [`examples/bot/src/plugins`](https://github.com/mivaya/Stambha/tree/main/examples/bot/src/plugins).

---

## Development

```bash
pnpm --filter @stambha/plugins build
pnpm --filter @stambha/plugins test
```
