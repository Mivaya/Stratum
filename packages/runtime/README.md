# @stambha/runtime

**Cross-runtime utilities** — shared abstractions for Node.js, Bun, and Deno (env, paths, fs, timers, crypto).

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

Used internally by `@stambha/core` and `@stambha/loader`. You rarely need to install it directly unless building Stambha-compatible tooling on Bun or Deno.

---

## Install

```bash
npm install @stambha/runtime
```

Requires **Node.js 20+** (Bun/Deno supported via conditional exports).

---

## Quick start

```ts
import { env, join, readDir, sleep } from "@stambha/runtime";

const token = env("DISCORD_TOKEN");
const src = join(process.cwd(), "src", "commands");

for await (const entry of readDir(src)) {
  console.log(entry.name);
}

await sleep(100);
```

---

## Key exports

| Export | Purpose |
|--------|---------|
| `env`, `cwd` | Environment and working directory |
| `join`, `resolve`, `basename`, `extname`, `pathToFileURL` | Path helpers |
| `readDir` | Async directory listing |
| `sleep`, `delay`, `cancelDelay` | Timers |
| `randomUUID` | UUID generation |
| `detectRuntime` | `"node"` \| `"bun"` \| `"deno"` |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | Primary consumer |
| [`@stambha/loader`](../loader) | File-system piece loading |

---

## Development

```bash
pnpm --filter @stambha/runtime build
pnpm --filter @stambha/runtime test
pnpm --filter @stambha/runtime smoke
```
