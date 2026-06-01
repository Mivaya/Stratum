# ADR 002: Bridge package removal

**Status:** Accepted (implemented)  
**Date:** 2026-05-29  
**Supersedes:** [ADR 001](./001-transport-vs-bridge.md)

## Context

Phases 15–20 delivered Stratum-owned transport (`@stratum/rest`, `@stratum/gateway`, `@stratum/transform`). Library bridges duplicated this role and pulled discord.js / Discordeno as dependencies.

## Decision

1. **Remove** `@stratum/bridge-discordjs` and `@stratum/bridge-discordeno` from the monorepo.
2. **Default stack** for all bots:
   - REST: `createNativeRestPort` / `createNativeRestWorker` / `deployCommands`
   - Gateway: `createGatewayEventHub` + WebSocket shard worker
   - Routing: `attachStratumClient` from `@stratum/gateway`
   - Split tier: `attachGatewayRelay` + `HttpRestPort` (`examples/bot`)
3. **Tests** use `MockBridge` from `@stratum/core`.

## Migration summary

| Was (bridge) | Now (native) |
|--------------|--------------|
| `createDiscordJsBridge` | `createGatewayEventHub` + `attachStratumClient` |
| `commandContextFromMessageViaRest` (bridge) | `commandContextFromStratumMessageViaRest` (`@stratum/transform`) |
| `createDiscordRestWorker` | `createNativeRestWorker` |
| `deployCommands` (bridge) | `deployCommands` from `@stratum/rest` |

## Consequences

- Examples and docs are native-only.
- `@stratum/transform` still offers optional discord.js / Discordeno **shape helpers** for gateway workers that emit library types — not full bridges.

## References

- [From Sapphire](/migration/from-sapphire)
- [From Discordeno](/migration/from-discordeno)
