# ADR 001: Transport vs bridge strategy

**Status:** Superseded by [ADR 002](./002-bridge-deprecation.md) (bridges removed)  
**Date:** 2026-05-29  
**Phase:** 21 (Migration & docs)

## Context

Stambha targets three audiences:

1. **Sapphire** users on discord.js who want structure without changing transport
2. **Discordeno** users who want big-bot topology (split REST, sharding, desired properties)
3. **Greenfield** bots that may never embed discord.js or Discordeno

We need a clear rule for when to use **bridges** (library adapters) vs **native transport** (`@stambha/transport`, `@stambha/rest`, `@stambha/gateway`).

## Decision

### 1. Core is transport-agnostic

All command pipeline, vault, sequences, chron, and registries live in `@stambha/core`. Core never imports discord.js or Discordeno.

### 2. Bridges are first-class, not legacy

- `@stambha/bridge-discordjs` and `@stambha/bridge-discordeno` implement the `Bridge` interface.
- New features (desired properties, signals, tier split) must work through bridges until native gateway reaches parity.
- **Bridges are not deprecated** by native transport.

### 3. Native transport grows alongside bridges

| Layer | Native package | Bridge alternative |
|-------|----------------|-------------------|
| REST | `@stambha/rest` | discord.js REST via bridge / `createDiscordRestWorker` |
| Gateway events | `@stambha/gateway` relay + future WS | Bridge WebSocket |
| Session / routes | `@stambha/transport` | Hidden inside bridge library |

Adopt native pieces **incrementally** (REST worker first, then gateway relay, then full native WS when available).

### 4. Default recommendations

| Bot profile | Gateway | REST | Rationale |
|-------------|---------|------|-----------|
| Small / existing discord.js | `bridge-discordjs` | In-process | Lowest friction |
| Medium discord.js, rate-limit pain | `bridge-discordjs` | `@stambha/rest` worker | Centralized REST without rewriting events |
| Discordeno / large sharded | `bridge-discordeno` or gateway relay | `@stambha/rest` | Matches big-bot layout |
| Tests | `MockBridge` | In-memory `RestPort` | No Discord I/O |
| Greenfield (future) | Native gateway when ready | `@stambha/rest` | Fewer dependencies |

### 5. Tier split uses RestPort abstraction

Gateway and bot workers communicate with Discord REST only through `RestPort` (`HttpRestPort` → worker HTTP). Swapping discord.js REST for `@stambha/rest` does not require changing command code.

### 6. One bridge per process

A running Stambha client attaches **one** `Bridge` instance. Multi-shard gateway scale uses multiple processes (tier split v2, resharding), not multiple bridges in one client.

## Consequences

**Positive**

- New Sapphire migrations target the native stack only ([ADR 005](./005-native-only-migration.md)).
- Discordeno users can migrate REST and sharding without rewriting commands.
- Native transport can mature without breaking existing bots.

**Negative**

- Two ways to reach Discord (bridge vs native) increases documentation surface.
- HTTP workers (`node:http`) remain Node-centric until abstracted.

**Mitigations**

- Migration guides ([MIGRATION_SAPPHIRE.md](../MIGRATION_SAPPHIRE.md), [MIGRATION_DISCORDENO.md](../MIGRATION_DISCORDENO.md)).
- Examples for monolith, tier split v1, and tier split v2.
- `RestPort` as the single swap point for REST.

## Alternatives considered

1. **Bridge-only forever** — Rejected for large bots; duplicates Discordeno REST/sharding work.
2. **Native-only (drop bridges)** — Rejected; destroys Sapphire migration story and forces big-bang rewrites.
3. **Fork discord.js inside Stambha** — Rejected; maintenance burden.

## References

- [TRANSPORT.md](../TRANSPORT.md)
- [TIER_SPLIT.md](../TIER_SPLIT.md)
- [GATEWAY.md](../GATEWAY.md)
- [ROADMAP.md](../ROADMAP.md)
