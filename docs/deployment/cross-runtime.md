# Cross-runtime (Node, Bun, Deno)

Phase 20 introduces `@stambha/runtime` — thin abstractions over environment, paths, filesystem, crypto, and timers so core packages can run outside Node.js where appropriate.

## Supported runtimes

| Runtime | Status | Notes |
|---------|--------|-------|
| **Node.js 20+** | Full | Primary target; HTTP workers, bridges, metrics |
| **Bun** | Partial | `@stambha/runtime`, `@stambha/core` sequences, loader |
| **Deno 2** | Partial | Same as Bun; use `deno check` + smoke for (see CI) |

Packages that depend on `node:http` (REST worker, gateway worker, metrics server) and `node:sqlite` (`@stambha/vault-sql`) remain **Node-only** until dedicated adapters land.

## `@stambha/runtime`

```ts
import {
  detectRuntime,
  env,
  cwd,
  randomUUID,
  join,
  resolve,
  pathToFileURL,
  readDir,
  sleep,
} from "@stambha/runtime";

console.log(detectRuntime()); // "node" | "bun" | "deno"
const token = env("DISCORD_TOKEN");
const id = randomUUID();
const files = await readDir(join(cwd(), "src/commands"));
```

### API surface

| Export | Purpose |
|--------|---------|
| `detectRuntime`, `isNode`, `isBun`, `isDeno` | Runtime detection |
| `env`, `cwd` | Environment & working directory |
| `randomUUID` | Web Crypto UUID (sequences, sessions) |
| `join`, `resolve`, `basename`, `extname`, `pathToFileURL` | Path helpers |
| `readDir` | Directory listing (`@stambha/loader`) |
| `sleep`, `delay`, `cancelDelay` | Timers |

## Package `exports` conditions

`@stambha/runtime` publishes runtime-specific export conditions for bundlers and Deno:

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "deno": "./dist/index.js",
    "bun": "./dist/index.js",
    "node": "./dist/index.js",
    "import": "./dist/index.js",
    "default": "./dist/index.js"
  }
}
```

Other packages keep a single ESM entry; cross-runtime support grows package-by-package.

## Consumers wired in Phase 20

- `@stambha/core` — `SequenceStore` uses `randomUUID` from runtime
- `@stambha/loader` — piece scanning uses `readDir`, `pathToFileURL`, portable paths

## CI matrix

GitHub Actions (`.github/workflows/ci.yml`):

- **Node 20 & 22** — full `pnpm build` + `pnpm test`
- **Bun** — runtime build, tests, smoke script
- **Deno** — `deno check` + smoke script

Local smoke:

```bash
pnpm --filter @stambha/runtime build
node packages/runtime/dist/smoke.js
bun packages/runtime/dist/smoke.js
deno run --allow-env --allow-read packages/runtime/dist/smoke.js
```

## Related

- [ROADMAP.md](./ROADMAP.md) — Phase 21 migration docs
- [TRANSPORT.md](./TRANSPORT.md) — native REST (Node HTTP worker today)
