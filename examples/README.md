# Stambha examples

| Directory | Purpose |
|-----------|---------|
| [`minimal/`](./minimal) | MockBridge only — smallest pipeline smoke test |
| [`bot/`](./bot) | **Full bot** — all Sapphire-style folders, native gateway + REST |

## Quick start

```bash
# Full layout, no token required
cd examples/bot && pnpm install && pnpm demo

# Minimal mock invoke
cd examples/minimal && pnpm install && pnpm start
```

See [`bot/README.md`](./bot/README.md) for folder layout and optional tier-split workers.
