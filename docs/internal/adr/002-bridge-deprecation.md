# ADR 002: Bridge package removal

**Status:** Accepted (implemented)  
**Date:** 2026-05-29  
**Supersedes:** [ADR 001](./001-transport-vs-bridge.md)

## Context

Phases 15–20 delivered Stambha-owned transport (`@stambha/rest`, `@stambha/gateway`, `@stambha/transform`). Library bridges duplicated this role and pulled discord.js / Discordeno as dependencies.

## Decision

1. **Remove** `@stambha/bridge-discordjs` and `@stambha/bridge-discordeno` from the monorepo.
2. **Default stack** for all bots:
   - REST: `createNativeRestPort` / `createNativeRestWorker` / `deployCommands`
   - Gateway: `createGatewayEventHub` + WebSocket shard worker
   - Routing: `attachStambhaClient` from `@stambha/gateway`
   - Split tier: `attachGatewayRelay` + `HttpRestPort` (`examples/bot`)
3. **Tests** use `MockBridge` from `@stambha/core`.

## Migration summary

| Was (bridge) | Now (native) |
|--------------|--------------|
| `createDiscordJsBridge` | `createGatewayEventHub` + `attachStambhaClient` |
| `commandContextFromMessageViaRest` (bridge) | `commandContextFromStambhaMessageViaRest` (`@stambha/transform`) |
| `createDiscordRestWorker` | `createNativeRestWorker` |
| `deployCommands` (bridge) | `deployCommands` from `@stambha/rest` |

## Consequences

- Examples and docs are native-only.
- `@stambha/transform` still offers optional discord.js / Discordeno **shape helpers** for gateway workers that emit library types — not full bridges.

## References

- [From Sapphire](/migration/from-sapphire)
- [From Discordeno](/migration/from-discordeno)
