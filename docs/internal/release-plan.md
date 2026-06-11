# Release plan — migration fixes & pipeline alignment

Planning doc for maintainers. Captures **near-term patch/minor work** validated by migrating an existing Sapphire production bot to Stambha, without duplicating work already scheduled in [future-v2.md](./future-v2.md).

**Rule:** Items marked **Pipeline** stay owned by [future-v2.md](./future-v2.md) and [roadmap.md](./roadmap.md). This document only adds **0.2.2** and **0.3.0** scope and maps every known gap to an owner.

**Migration policy:** [ADR 005](./adr/005-native-only-migration.md) — native stack only; no official hybrid discord.js path.

---

## Release lanes

| Lane | Version | Scope |
|------|---------|--------|
| **Patch** | **0.2.2** | Bugs and small API extensions that unblock native Sapphire migrations |
| **Minor** | **0.3.x** | Native migration completion — bundled WS gateway (A5), loader/DX, bootstrap docs |
| **Pipeline** | **1.x** | [future-v2.md](./future-v2.md) — B1 declarative gates, C1 permission levels, Redis drivers |
| **Plugins repo** | `@stambha/dashboard` etc. | Pillar E — HTTP, OAuth, dashboard routes |
| **Major** | **2.0** | Bus, distributed chron, breaking CommandOptions only if required |

Sequencing:

```text
0.2.2  — Per-command gates, prefix resolver, loader order, native bootstrap docs
0.3.0  — A5 bundled gateway WS, native examples, epilogue/DI docs (no hybrid helpers)
1.0.0  — Stable API, documented known gaps
1.x    — B1, C1, Redis cache/cooldown
2.0.0  — A3 bus, native runSequence, distributed chron (A5 already in 0.3)
```

---

## 0.2.2 (patch) — backlog

| ID | Item | Type | Package | Closes |
|----|------|------|---------|--------|
| **P1** | Per-command gate resolution (`gateNames` on `Command`, not all global gates on every command) | Design fix | `@stambha/core` | App `appliesTo()` gate filters |
| **P2** | `resolvePrefix` on gateway attach / `attachStambhaClient` | Extension | `@stambha/gateway` | Dynamic per-guild prefix |
| **P4** | Loader loads gates before commands, or post-load `resolveCommandGateNames()` | Bug | `@stambha/loader` | Gate name resolution at command construct time |
| **P5** | Native startup order documented (`markReady` → `start()` → lifecycle events) | Docs | `docs/migration/from-sapphire.md` | Ad-hoc bootstrap ordering |
| **P6** | Registry API documented (`values()`, not iterable `Registry`) | Docs | `packages/core/README.md` | Help/admin commands iterating commands |
| **P7** | CJS migration notes (`import type`, `moduleResolution`) | Docs | Migration guide | Done in 0.2.1 — keep documented |

**Cancelled (ADR 005):** P3 `preserveRaw`, hybrid startup patterns.

**Explicitly not in 0.2.2** (pipeline): dashboard HTTP, declarative cooldowns, `@stambha/levels`, Redis, help package, bundled WS gateway.

---

## 0.3.0 (minor) — native migration

| ID | Item | Package | Notes |
|----|------|---------|-------|
| **N1** | Bundled WebSocket shard client → `GatewayEventHub` | `@stambha/gateway` | Pulls forward future-v2 **A5**; blocker for full native migration |
| **N2** | `examples/bot` native bootstrap as reference (monolith + tier split) | `examples/`, docs | Replaces planned `hybrid-discordjs` example |
| **N3** | Hook `static create(ctx)` factory documented; optional binder injection | `@stambha/loader`, docs | Replaces hook base classes with `container` getter |
| **N4** | Client events → epilogue templates (`commandSuccess`, `commandDenied`, `commandError`) | `@stambha/core` docs | Replaces `client.on(...)` in bootstrap |
| **N5** | Shard-0-only slash deploy pattern | `@stambha/rest` docs | Multi-process sharding with native gateway |
| **N6** | `deployCommands` dry-run + diff in CI examples | `@stambha/rest` | Operational safety |

**Cancelled (ADR 005):** M1 `attachDiscordJsGateway`, M2 `examples/hybrid-discordjs`.

---

## Full gap coverage matrix

Every gap identified during a full Sapphire → Stambha migration is assigned below. **Nothing unowned.**

| Gap | Owner |
|-----|--------|
| Dashboard HTTP API (routes, OAuth, CORS) | **Plugins E1–E4** (`@stambha/dashboard`) |
| Per-command gates (Sapphire preconditions) | **0.2.2 P1** |
| Dynamic / per-guild prefix | **0.2.2 P2**; long-term **1.x C2** (Vault) |
| Native gateway WebSocket (no custom `hub.emit` wiring) | **0.3.0 N1** (A5) |
| Declarative command options → auto-gates | **1.x B1** |
| Permission levels | **1.x C1** (`@stambha/levels`) |
| Slash `SlashCommandBuilder` interop | **1.x** REST collector or **B1** slash tree |
| Sapphire `Args` parity | **1.x B2** |
| Container / DI (prisma, logger) | **0.3.0 N3** + **1.x** plugins |
| Sharding / resharding | **0.3.0 N1, N5** + existing `@stambha/gateway` APIs |
| Hot load / unload / reload | **Plugins** `@stambha/dev-reload` |
| Pipeline events vs Sapphire command listeners | **0.3.0 N4** |
| Hook multi-argument event payloads | **0.3.0 N3** + native hub normalization |
| Loader category from folder path (`fullCategory`) | **1.x B3** help system |
| Registry iteration | **0.2.2 P6** |
| Built-in help command | **1.x B3** (`@stambha/help`) |
| Structured logger | **1.x** plugins (LoggingPlugin pattern) |
| Guild config (prefix, modules, flags, level overrides) in Vault — **not** full ORM migration | **1.x C2** ([ADR 004](./adr/004-vault-scope-orm-coexistence.md)) |
| Redis cache / shared cooldown | **1.x A1–A2** |
| Distributed Chron | **2.0 D2** |
| Dual ESM/CJS builds | **Done 0.2.1** |
| Sequences / complex slash trees | **2.0 D1** + **1.x B1** |
| Hybrid discord.js gateway / `preserveRaw` | **Cancelled** — [ADR 005](./adr/005-native-only-migration.md) |

---

## Pipeline (unchanged — do not reprioritize)

| Pillar | Source | Deliverables |
|--------|--------|--------------|
| **A** | Distributed infra | Redis cache/cooldown, RabbitMQ bus, Influx (**A5 → 0.3.0**) |
| **B** | Sapphire command options | B1 declarative gates, B2 prefix flags, B3 help |
| **C** | Permission levels | C1 `@stambha/levels`, C2 Vault overrides |
| **D** | Stambha-only | Vault HTTP, sequences, reshard barriers, distributed chron |
| **E** | Dashboard | `@stambha/dashboard` in plugins repo (ADR 003) |

See [future-v2.md](./future-v2.md) for phases, dependency graph, and open questions.

---

## Related

- [migration-shims.md](./migration-shims.md) — deprecated app-layer patterns
- [future-v2.md](./future-v2.md) — post-1.0 pillars
- [roadmap.md](./roadmap.md) — feature matrix
- [adr/005-native-only-migration.md](./adr/005-native-only-migration.md) — native-only policy
- [adr/002-bridge-deprecation.md](./adr/002-bridge-deprecation.md) — no bridge packages
- [adr/004-vault-scope-orm-coexistence.md](./adr/004-vault-scope-orm-coexistence.md) — Vault = settings + bot-shaped data; ORM for domain
