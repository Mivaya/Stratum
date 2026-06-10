# Stambha roadmap — future goals

Stambha’s long-term goal is to be a **first-class bot framework** that combines the best of **Sapphire** (developer ergonomics, piece model, command pipeline) and **Discordeno** (scale, split processes, memory control) — plus **original capabilities neither provides** (Vault, Sequences, transport-agnostic core).

This document lists **core unique features** from each source, what Stambha already has, and the planned phases to close gaps.

**Branch rule (unchanged):** `feature/{short-name}`

---

## Product vision

```text
┌─────────────────────────────────────────────────────────────────┐
│  Stambha = Sapphire ergonomics + Discordeno scale + originals   │
├─────────────────────────────────────────────────────────────────┤
│  @stambha/core        Framework (never imports discord.js/Deno) │
│  @stambha/transport*  Native gateway + REST (future, optional)  │
│  @stambha/transform   Payload normalization (optional lib shape helpers) │
└─────────────────────────────────────────────────────────────────┘
```

**End state:** Authors write against Stambha APIs only. Discord connectivity comes from Stambha-owned transport **or** optional bridges — not from wrapping Sapphire or requiring discord.js in core.

---

## Feature matrix

Legend: **Done** · **Partial** · **Planned** · **Won't** (explicit non-goal)

### From Sapphire (discord.js ergonomics)

Sapphire’s value is **structure and DX** on top of discord.js — command stores, preconditions, arguments, plugins, interaction handlers.

| Feature | Sapphire | Stambha today | Target |
|---------|----------|---------------|--------|
| Piece stores (commands, listeners) | CommandStore, ListenerStore | **Done** — `Command`, `Hook`, registries + `@stambha/loader` | Keep |
| Preconditions | PreconditionStore | **Done** — `@stambha/gates` (cooldown, permissions, NSFW, RunIn) | Maintain |
| Global inhibitors | — (use plugins) | **Done** — `Barrier` | Keep |
| Post-command hooks | — | **Done** — `Epilogue` | Keep |
| Middleware | — | **Done** — `Conduit` | Keep |
| Arguments / `Args` parsing | ArgumentStore, typed resolvers | **Done** — `@stambha/args` | Maintain |
| Slash subcommands & groups | Command options tree | **Done** — Phase 13 | Core + deploy |
| Prefix aliases | Command aliases | **Done** — `CommandIndex` | Router |
| Command categories | category / subCategory | **Done** — metadata + help | Help command |
| Built-in cooldown gate | Precondition + scope | **Done** — `@stambha/gates` | Maintain |
| Built-in permission gate | Client + user permissions | **Done** — `@stambha/gates` | Maintain |
| Built-in NSFW / RunIn gates | Channel type checks | **Done** — `@stambha/gates` | Maintain |
| Interaction handlers | InteractionHandlerStore | **Partial** — `Signal` + `resolveInteractionTarget` | Full handler store later |
| Autocomplete handlers | Interaction handlers | **Done** — `Command.autocomplete()` | Bridge routing |
| Slash deploy / registry | Application command registries | **Done** — `buildApplicationCommands`, deploy diff | Bridges |
| Plugin system | Plugin hooks (pre/post init, login) | **Done** — `@stambha/plugins` | Maintain |
| Logger / container DI | `@sapphire/pieces` Container | **Done** — `StambhaContainer` + `Binder` | Maintain |
| Error listeners | Default error listeners | **Partial** — client events (`commandError`, etc.) | Default handlers Phase 11 |
| Message commands | Optional loadMessageCommandListeners | **Done** — prefix via bridge + router | Keep |
| Depends on discord.js | Always | **No** — bridge only | Keep core free |

### From Discordeno (scale & architecture)

Discordeno’s value is **operational scale** — split gateway/REST, rate-limit centralization, memory trimming, sharding/resharding.

| Feature | Discordeno | Stambha today | Target |
|---------|------------|---------------|--------|
| Split gateway / REST / bot processes | First-class | **Partial** — `RestPort`, tier split, REST worker | Native transport Phase 15–16 |
| Centralized REST rate limits | `@discordeno/rest` proxy | **Done** — `@stambha/rest` + metrics | Native gateway **Done** (Phase 18) |
| desiredProperties (RAM trim) | Per-bot property mask | **Done** — client mask + Discordeno sync | Maintain |
| Transformers (Discord ↔ internal) | Bidirectional transformers | **Done** — `@stambha/transform` | Bridge adapters |
| Gateway manager + shard workers | `@discordeno/gateway` | **Done** — Phase 18 | `@stambha/gateway` |
| Zero-downtime resharding | Automated / manual | **Done** — Phase 19 | `@stambha/gateway` reshard API |
| Gateway proxy / fast resume | DD proxy patterns | **Planned** — Phase 19 | Optional proxy package |
| Custom caches | Pluggable cache layer | **Done** — Phase 18 (memory) | `@stambha/cache` |
| Cross-runtime (Node, Deno, Bun) | Yes | **Done** — Phase 20 | `@stambha/runtime` |
| Functional handlers (no classes) | Preferred style | **Won't** — class pieces match Sapphire ergonomics | Gates/args support functions |
| Horizontal worker scaling | Cluster / workers | **Partial** — tier split v1 + v2 | Worker orchestration Phase 19 |
| REST proxy from gateway | `rest.proxy` | **Partial** — `HttpRestPort` | Unified with native REST |

### Stambha originals (neither Sapphire nor Discordeno)

| Feature | Stambha today | Notes |
|---------|---------------|-------|
| Transport-agnostic `Bridge` | **Done** | Core never imports Discord libs |
| `Outcome` / typed errors | **Done** | `ok()` / `err()` pipeline |
| **Vault** (Blueprint / Ledger / Record) | **Done** | Settings + bot-shaped data ([ADR 004](./adr/004-vault-scope-orm-coexistence.md)); ORM for heavy domain |
| **Sequences** (multi-step UI) | **Done** | `stambha:seq:…` custom IDs |
| **Chron** (cron tasks) | **Done** | `src/tasks/` loader path |
| **Scouts** (passive watchers) | **Done** | Passive event watchers |
| **Signals** (components) | **Done** | Buttons, selects, modals |
| **Metrics** (Prometheus) | **Done** | `@stambha/metrics` |
| **MockBridge** (test without Discord) | **Done** | Core testing |
| **Tier** + **worker roles** | **Done** | monolith / split |
| Native `@stambha/transport` | **Planned** | Phase 15+ — Stambha-owned gateway/REST |
| Migration guides from Sapphire / Discordeno | **Done** — Phase 21 | [MIGRATION.md](./MIGRATION.md) |

---

## What we are **not** building

- A fork of Sapphire or a discord.js wrapper marketed as Stambha
- A 1:1 Discordeno API clone inside `@stambha/core`
- Requiring discord.js **or** Discordeno to use the framework core (bridges stay optional)
- **Vault as a full ORM** — Prisma/Drizzle remain the right tool for economy, quest graphs, analytics, and large relational models ([ADR 004](./adr/004-vault-scope-orm-coexistence.md))

---

## Vault scope (Path B)

**Decision:** Vault = **settings + bot-shaped data only**. Official coexistence with Prisma/SQL.

| Vault owns | ORM / SQL owns |
|------------|----------------|
| Guild / user / member config | Multi-table transactions |
| Prefix, modules, toggles, log channel ids | Economy, shops, inventories |
| Feature flags | Quest / achievement graphs |
| Permission level overrides (1.x + `@stambha/levels`) | Large mod-log tables & reporting |
| Dashboard-editable bot settings | Analytics & ad-hoc queries |
| Small per-member stats as ledgers (optional) | Anything already in `schema.prisma` |

**Reference:** Document-oriented guild/user settings (common in older bots); not a Prisma replacement.

### Vault evolution (1.x)

| Deliverable | Package | Notes |
|-------------|---------|-------|
| Blueprint migrations | `@stambha/vault` | Versioned schema changes |
| Discord serializers + `resolve()` | `@stambha/vault` | Channel / role / user fields |
| Array update API | `@stambha/vault` | `add` / `remove` / `overwrite` on array fields |
| Guild settings attach | `@stambha/core` or vault plugin | `guild.settings` ergonomics |
| SQL / Redis drivers | plugins repo | `vault-sql`, `vault-redis` |
| Level overrides in blueprint | `@stambha/levels` + vault | Pillar C2 |
| Dashboard CRUD | `@stambha/dashboard` | Pillar E3 |

---

## Implementation phases (11+)

Phases 1–10 are complete — see [PHASES.md](./PHASES.md#completed).

### Phase 11 — Built-in gates (`@stambha/gates`) ✅

**From Sapphire:** Cooldown, Permissions, NSFW, RunIn, UserPermissions.

| Deliverable | Status |
|-------------|--------|
| `@stambha/gates` package | Done |
| Cooldown | Done — limit + delay + scope |
| Permissions | Done — member + client bitfields |
| NSFW / RunIn | Done |
| Default error UX | Done — `attachGateDeniedReply()` |
| `CommandContext.meta` | Done — bridges populate metadata |

**Branch:** `feature/gates`

---

### Phase 12 — Arguments (`@stambha/args`) ✅

**From Sapphire:** ArgumentStore, `Args`, resolvers (string, integer, member, channel, …).

| Deliverable | Status |
|-------------|--------|
| `@stambha/args` | Done |
| Prefix lexer + `Args` | Done |
| `CommandContext.argsText` | Done — bridges pass prefix args |
| Slash options | Done — `SlashArgs`, `slashOptions` on context |
| Custom resolvers | Done — `defineArgResolver`, `ArgRegistry` |
| Validation UX | Done — `replyArgError`, `replyIfArgError` |

**Branch:** `feature/args`

---

### Phase 13 — Command tree & deploy ✅

**From Sapphire:** Subcommands, groups, aliases, autocomplete, application command registry.

| Deliverable | Status |
|-------------|--------|
| `CommandSlashPath`, slash metadata on `Command` | Done |
| `buildApplicationCommands()` | Done |
| `CommandIndex` (aliases + slash paths) | Done |
| Autocomplete on `Command` | Done |
| Deploy diff + permissions fields | Done |
| Help command example | Done |

**Branch:** `feature/command-tree`

---

### Phase 14 — Plugins & container ✅

**From Sapphire:** Plugin hooks, Container, logger.

| Deliverable | Description |
|-------------|-------------|
| `@stambha/plugins` | `preInit`, `postInit`, `preStart`, `postStart`, `postLoad` hooks |
| `StambhaContainer` | Logger, config, shared services (extends `DefaultStambhaContainer`) |
| Interaction handler unification | `resolveInteractionTarget` facade (Signal + autocomplete) |
| Official extensions | Separate repo **`stambhadev/plugins`** — e.g. `@stambha/dashboard`, `@stambha/i18n` ([ADR 003](./adr/003-plugins-monorepo.md); no `@stambha/plugin-*` names) |

**Branch:** `feature/plugins` · **Docs:** [PLUGINS.md](./PLUGINS.md)

---

### Phase 15 — Transport foundation (`@stambha/transport`) ✅

**From Discordeno:** Own the Discord wire protocol inside Stambha (not a bridge).

| Deliverable | Description |
|-------------|-------------|
| `@stambha/transport` | Shared types, rate-limit bucket model, session info |
| `@stambha/rest` | REST client with centralized queue (Discordeno-inspired) |
| Bridge deprecation path | Document: new bots → transport; existing → bridges |

**Branch:** `feature/transport` · **Docs:** [TRANSPORT.md](./TRANSPORT.md)

---

### Phase 16 — Native REST worker ✅

**From Discordeno:** Standalone REST process, proxy from gateway workers.

| Deliverable | Description |
|-------------|-------------|
| REST worker server | `createNativeRestWorker` replaces discord.js REST worker |
| `RestPort` implementation | `NativeRestPort` + `HttpRestPort` gateway client |
| Bearer auth + health | Parity with `createRestWorkerServer` |
| Rate-limit metrics | `createPrometheusRestMetrics` in `@stambha/metrics` |

**Branch:** `feature/native-rest` · **Docs:** [NATIVE_REST.md](./NATIVE_REST.md)

---

### Phase 17 — Desired properties & transformers ✅

**From Discordeno:** Memory-efficient payloads, bidirectional transform layer.

| Deliverable | Description |
|-------------|-------------|
| `desiredProperties` config | On `StambhaClient` / transport bot |
| Slim `CommandContext` fields | Only requested props populated |
| `@stambha/transform` | Gateway payload → Stambha shapes → REST payloads |
| Bridge adapters | discord.js + Discordeno context via transform layer |

**Branch:** `feature/desired-properties` · **Docs:** [DESIRED_PROPERTIES.md](./DESIRED_PROPERTIES.md)

---

### Phase 18 — Gateway manager & cache

**From Discordeno:** Shard spawning, workers, custom cache.

| Deliverable | Description |
|-------------|-------------|
| `@stambha/gateway` | Shard manager, identify, resume |
| Worker protocol | Gateway worker ↔ bot worker messaging |
| `@stambha/cache` | Pluggable cache (memory, Redis) |
| Tier split v2 | Native gateway + REST + bot workers |

**Branch:** `feature/gateway` · **Docs:** [GATEWAY.md](./GATEWAY.md)

---

### Phase 19 — Sharding & resharding

**From Discordeno:** Zero-downtime resharding, gateway proxy patterns.

| Deliverable | Description |
|-------------|-------------|
| Shard calculator | Guild count → shard count |
| Automated resharding | Threshold-based (configurable %) |
| Manual resharding API | Operator-triggered |
| Identify budget management | Safe identify spacing |

**Branch:** `feature/resharding` · **Docs:** [RESHARDING.md](./RESHARDING.md)

---

### Phase 20 — Cross-runtime

**From Discordeno:** Node, Deno, Bun.

| Deliverable | Description |
|-------------|-------------|
| Runtime abstraction | FS, env, timers where needed |
| CI matrix | Node 20+, Bun, Deno |
| Publish `exports` conditions | Dual package if required |

**Branch:** `feature/cross-runtime` · **Docs:** [CROSS_RUNTIME.md](./CROSS_RUNTIME.md)

---

### Phase 21 — Migration & docs

**Stambha original:** Onboard Sapphire and Discordeno users.

| Deliverable | Description |
|-------------|-------------|
| `docs/MIGRATION_SAPPHIRE.md` | Piece name mapping, Gate vs Precondition |
| `docs/MIGRATION_DISCORDENO.md` | Big bot → Stambha tier layout |
| `docs/MIGRATION_KLASA.md` | Monitors → Scouts, etc. |
| Architecture decision records | Transport vs bridge strategy |

**Branch:** `feature/migration-docs` · **Docs:** [MIGRATION.md](./MIGRATION.md)

---

## Priority order (recommended)

For **DX first** (Sapphire audience):

```text
11 gates → 12 args → 13 command tree → 14 plugins → 15+ transport
```

For **scale first** (Discordeno audience):

```text
15 transport → 16 native REST → 17 desired props → 18 gateway → 19 resharding
```

For **balanced** (recommended default):

```text
11 gates → 12 args → 13 command tree → 15 transport → 16 REST → 17 props → 18 gateway
```

Plugins (14) can run parallel to transport work — different contributors, no hard dependency.

---

## Success criteria

Stambha reaches **1.0.0** when:

1. **Core** runs a production bot with **native transport** (no required bridge).
2. **Sapphire parity** on daily authoring: gates pack, args, subcommands, deploy, loader.
3. **Discordeno parity** on ops: split tier, centralized REST, sharding path, desired properties.
4. **Originals** remain first-class: Vault (Path B scope documented), Sequences, Chron, Metrics documented and stable.
5. Bridges (`discord.js`, Discordeno) are **optional compatibility layers**, not the main story.

---

## Contributing

Pick a phase, open an issue referencing this doc, branch `feature/{short-name}`, and follow [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md).

Large phases (15–19) should be broken into sub-PRs (e.g. `feature/transport-types` before `feature/gateway-shards`).
