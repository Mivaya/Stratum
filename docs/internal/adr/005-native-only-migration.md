# ADR 005 — Native-only migration path

**Status:** Accepted  
**Date:** 2026-05-29  
**Supersedes:** Hybrid discord.js migration items in release-plan 0.3.0 (M1–M2, P3)

## Context

Early Sapphire migrations validated app-layer shims: custom `wire*ToHub`, `preserveRaw`, `attachDiscordJsGateway`, and `examples/hybrid-discordjs`. ADR 002 removed bridge packages; the hybrid path kept discord.js as the gateway and context source while routing commands through Stambha.

Production experience showed hybrid stacks duplicate transport concerns (discord.js + `@stambha/transform` + custom bootstrap), complicate tier split, and delay adoption of `@stambha/rest`, `@stambha/gateway`, and `@stambha/transform`.

## Decision

**Official migrations are 100% native.** New bots and migration guides use only:

| Layer | Package |
|-------|---------|
| REST | `@stambha/rest` |
| Gateway events | `@stambha/gateway` (`GatewayEventHub`, worker bus, shard manager) |
| Shapes | `@stambha/transform` |

**Not supported as an official path:**

- `attachDiscordJsGateway` / `wireDiscordJsToHub` helpers in core
- `preserveRaw` for legacy `messageRun` / `chatInputRun` bodies
- `examples/hybrid-discordjs`
- Keeping discord.js for gateway + Stambha for commands only

`@stambha/transform` may still expose optional discord.js **shape** helpers for adopters who choose discord.js independently — that is not a migration shim.

**0.3.0 blocker:** bundled native WebSocket gateway client (formerly future-v2 **A5**, pulled forward from 2.0). Until it ships, adopters wire their own shard WebSocket into `GatewayEventHub` (see `examples/bot`).

## Consequences

**Positive**

- One transport story in public docs and examples
- Tier split v2 uses the same packages in every process
- Clear deletion path for app-layer shims ([migration-shims.md](../migration-shims.md))

**Negative**

- Sapphire bots that relied on discord.js sharding must adopt native gateway patterns or wait for A5
- No gradual “commands first, gateway later” official recipe

## Related

- [ADR 002 — Bridge deprecation](./002-bridge-deprecation.md)
- [release-plan.md](../release-plan.md) — 0.3.0 native migration scope
- [migration-shims.md](../migration-shims.md) — deprecated patterns
