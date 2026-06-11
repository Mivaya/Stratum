# Deployment overview

Stambha supports three deployment shapes:

| Shape | When to use | Packages |
|-------|-------------|----------|
| **Monolith** | Development, small bots | `@stambha/rest` in-process |
| **Tier split** | Rate-limit isolation | REST worker + gateway with `HttpRestPort` |
| **Tier split v2** | Maximum separation | REST + gateway relay + bot worker |

## Monolith

One process: `createNativeRestPort(token)` + `GatewayEventHub` + your WebSocket shard code.

## Tier split (v1)

- **REST worker** — `@stambha/rest` (`createNativeRestWorker`)
- **Gateway** — `createStambhaBot` with `HttpRestPort` pointing at the worker

See [Tier split](/deployment/tier-split).

## Tier split (v2)

Three processes:

1. REST worker (`pnpm rest`)
2. Bot worker — `createWorkerServer` + StambhaClient
3. Gateway relay — `GatewayEventHub` + `attachGatewayRelay`

Example: `examples/bot` (`pnpm split:*` for three-process layout).

## Large bots

Add [Gateway](/deployment/gateway) worker bus, [resharding](/deployment/resharding), [desired properties](/features/desired-properties), and [metrics](/deployment/metrics).