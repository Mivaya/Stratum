# Future release plan (post-1.0 / v2)

Target: **major release** after `1.0.0` stabilizes the native stack (`@stratum/rest`, `@stratum/gateway`, `@stratum/transform`, `@stratum/core`).

This document turns product ideas into **phased, shippable work**. Branch rule unchanged: `feature/{short-name}`.

---

## Goals

1. **Scale like Discordeno** — shared state and messaging across gateway / REST / bot workers.
2. **DX like Sapphire** — declare command behavior in options; gates wire automatically.
3. **Governance like Klasa** — permission levels with guild overrides.
4. **Stratum-only** — capabilities no other framework combines in one native stack.

---

## Pillar A — Distributed infrastructure

Today: in-memory cache (`@stratum/cache`), in-memory cooldown store, HTTP worker bus, no bundled metrics backend.

| Component | Purpose | Package (proposed) | Notes |
|-----------|---------|-------------------|--------|
| **Redis cache** | Guild/user/session cache across workers | `@stratum/cache-redis` | Implements existing `Cache` interface |
| **Redis cooldown store** | Shared rate limits in split tier | `@stratum/gates` + redis driver | Plugs into `CooldownStore` (already abstracted) |
| **Redis Vault driver** | Optional shared settings (or cache layer) | `@stratum/vault-redis` | Debounced writes; SQLite/Postgres remain |
| **Message bus (RabbitMQ)** | Gateway → bot events at scale; fan-out | `@stratum/bus` | Interface: `WorkerBus` + `RabbitWorkerBus` |
| **InfluxDB telemetry** | Gateway identify rate, REST 429s, command latency | `@stratum/metrics-influx` | Optional sink beside Prometheus |
| **Native WebSocket gateway** | Stop requiring custom `hub.emit` wiring | `@stratum/gateway` (extend) | Shard connect, resume, identify budget integration |

### Suggested phases

| Phase | Branch | Deliverable |
|-------|--------|-------------|
| A1 | `feature/cache-redis` | `createRedisCache()` + docs |
| A2 | `feature/cooldown-redis` | `RedisCooldownStore` for split tier |
| A3 | `feature/bus-rabbitmq` | `RabbitWorkerBus` + tier-split example |
| A4 | `feature/metrics-influx` | Influx line protocol adapter |
| A5 | `feature/gateway-ws` | Bundled shard client → `GatewayEventHub` |

**Design rule:** every backend implements a **core interface** (like `Cache`, `CooldownStore`, `WorkerBus`) so monolith/single-node still works with memory defaults.

---

## Pillar B — Sapphire-style command options

Reference: [Sapphire Command Options](https://sapphirejs.dev/docs/Guide/commands/command-options).

Today Stratum supports the **behavior** via manual gates, but not **declarative options** on `Command`.

### Gap matrix

| Sapphire option | Stratum today | v2 target |
|-----------------|---------------|-----------|
| `cooldownDelay` / `cooldownLimit` / `cooldownScope` | Manual `cooldownGate()` | Auto-gate from `CommandOptions` |
| `cooldownFilteredUsers` | Gate option | Same |
| `requiredUserPermissions` / `requiredClientPermissions` | Manual permission gates | Auto-gate from options |
| `nsfw` | Manual `nsfwGate()` | `nsfw: true` on command |
| `runIn` | Manual `runInGate()` | `runIn: RunIn[]` on command |
| `preconditions` | `gates: [...]` array | Alias + name registry resolution |
| `description` | **Done** | — |
| `detailedDescription` | Missing | Help system + typed object |
| `fullCategory` | `category` / `subCategory` | `fullCategory: string[]` from loader path |
| `aliases` | **Done** | + `generateDashLessAliases` / `generateUnderscoreLessAliases` |
| Prefix `flags` / `options` / `quotes` / `separators` | Partial (`@stratum/args` lexer) | Command-level prefix strategy |
| `typing` | Missing | Optional typing indicator via REST |
| `dmPermission` / slash permissions | **Done** (slash deploy) | — |

### Implementation sketch

```ts
// packages/core — extended CommandOptions
interface CommandOptions {
  cooldown?: { limit: number; delay: number; scope?: CooldownScope; filteredUsers?: string[] };
  requiredUserPermissions?: PermissionFlag;
  requiredClientPermissions?: PermissionFlag;
  nsfw?: boolean;
  runIn?: RunInOption[];
  detailedDescription?: DetailedDescription; // module-augmentable
  flags?: string[] | boolean;
  options?: string[] | boolean;
  // ...
}
```

**Phase B1** (`feature/declarative-gates`): `resolveCommandGates(command)` in `@stratum/gates` — merges declarative options + explicit `gates[]` before pipeline run.

**Phase B2** (`feature/prefix-flags`): Extend `@stratum/args` for Sapphire-style `--key=value` flags on prefix commands.

**Phase B3** (`feature/help-system`): `@stratum/help` or core help registry using `detailedDescription`, categories, permission level hints.

---

## Pillar C — Klasa-style permission levels

Reference: [Klasa — Understanding Permission Levels](https://klasa.js.org/#/docs/klasa/v0.5.0/Getting%20Started/UnderstandingPermissionLevels).

Klasa maps **numeric levels** (Everyone → Moderator → Administrator → Owner) to commands. Stratum should do this **without** coupling to discord.js.

### Proposed API

```ts
// @stratum/levels (new package)
interface PermissionLevelRegistry {
  register(level: number, name: string, check: (ctx: CommandContext) => boolean | Promise<boolean>): void;
}

// CommandOptions
permissionLevel?: number; // minimum level required

// Default ladder (configurable)
// 0 Everyone, 1 Moderator (ManageMessages), 2 Admin (Administrator), 10 Bot Owner (env)
```

### Vault integration (Stratum-only twist)

Store **per-guild level overrides** in Vault:

```ts
// schemas/ModerationBlueprint.ts
memberLevels: field.record(field.number()) // userId → level
```

A user's effective level = `max(discordDerivedLevel, vaultOverride)`.

**Phases:**

| Phase | Branch | Deliverable |
|-------|--------|-------------|
| C1 | `feature/permission-levels` | `@stratum/levels` + `permissionLevelGate` |
| C2 | `feature/levels-vault` | Guild member level ledger + admin commands |

---

## Pillar E — Dashboard HTTP API (`@stratum/dashboard`)

**Repo:** Ships from the **official plugins monorepo** ([ADR 003](./adr/003-plugins-monorepo.md)) — not the core Stratum repo. Do **not** use Sapphire-style names like `@stratum/plugin-api`.

**Today:** No equivalent to [Sapphire Plugin API](https://sapphirejs.dev/docs/Guide/plugins/API/getting-started). Stratum has **operator** HTTP servers only:

| Server | Purpose | Not for dashboards |
|--------|---------|-------------------|
| `createNativeRestWorker` | Discord REST proxy | Internal worker protocol |
| `createWorkerServer` | Gateway ↔ bot bus | Internal worker protocol |
| `createReshardServer` | Reshard operator API | Ops only |
| `createMetricsServer` | Prometheus scrape | Metrics only |

`@stratum/plugins` provides **lifecycle hooks + DI** (`preStart`, `postLoad`, `StratumContainer`) — not route registration or OAuth.

**Vault** covers **data** (guild/user settings) but not **HTTP exposure** for a web dashboard.

### Target (dashboard backend, Stratum naming)

New package: **`@stratum/dashboard`** — optional extension in **`stratumdev/plugins`**, not in core.

| Feature | Sapphire `@sapphire/plugin-api` (reference only) | `@stratum/dashboard` |
|---------|---------------------|----------------|
| HTTP server on bot process | Yes | Yes — `listenOptions.port` |
| Route registration | File-based / decorators | `defineRoute` or `routes/` folder + loader |
| Discord OAuth2 login | Built-in | OAuth2 for dashboard admins |
| Auth cookie / session | Yes | Yes — HTTP-only cookie |
| CORS `origin` | Yes | Yes |
| Rate limits on routes | Yes | Reuse `@stratum/gates` / cooldown patterns |
| Read/write bot config | Custom | **First-class Vault routes** — typed blueprints |
| Tier split | Single process | API on **bot worker**; Vault driver shared (Redis/SQL) |

### Example API (sketch)

```ts
import { createDashboardPlugin } from "@stratum/dashboard";

export default createDashboardPlugin({
  listen: { port: 4000 },
  origin: "https://dashboard.example.com",
  auth: {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    redirect: "https://dashboard.example.com/callback",
    scopes: ["identify"],
  },
  routes: (app, ctx) => {
    app.get("/guilds/:id/settings", async (req) => {
      const record = ctx.vault.ledger("guild").acquire(req.params.id);
      await record.sync();
      return record.toJSON();
    });
  },
});
```

Attach via existing `attachPlugins(client, { plugins: [apiPlugin] })`.

### Phases

| Phase | Branch (plugins repo) | Deliverable |
|-------|----------------------|-------------|
| E1 | `feature/dashboard-core` | Router interface, `createDashboardServer`, health route |
| E2 | `feature/dashboard-oauth` | Discord OAuth2 + session middleware |
| E3 | `feature/dashboard-vault` | CRUD routes for Vault ledgers (dashboard backend) |
| E4 | `feature/dashboard-split` | API sidecar or bot-worker mount for tier split |

**Dependency:** Vault (done) + permission levels (Pillar C) for locking admin routes.

**Non-goal:** Bundling a frontend — API only; dashboard is user's Next.js/React app.

---

## Pillar D — Stratum-only (neither Sapphire, Klasa, discord.js, nor Discordeno)

These are the **reason to pick Stratum** after parity work is done.

| Feature | Why unique | Package |
|---------|------------|---------|
| **Vault HTTP API** | Dashboard reads/writes Vault via `@stratum/dashboard` — typed, not ad-hoc JSON | `@stratum/dashboard` + `@stratum/vault` |
| **Vault + Sequences** | Setup wizards persist answers to schema | `@stratum/core` sequences + vault ctx |
| **Declarative gates + split tier** | Sapphire DX with Discordeno topology | core + gates + redis cooldown |
| **Desired properties + permission levels** | Trim payloads *and* keep enough meta for levels/gates | `@stratum/transform` |
| **Outcome pipeline everywhere** | Typed `ok`/`err` — not exceptions in commands | `@stratum/core` (done — extend to bus handlers) |
| **Reshard-aware command routing** | Pause/drain commands during resharding | `@stratum/gateway` + `Barrier` |
| **Distributed Chron** | One cron tick cluster-wide (Redis lock) | `@stratum/core` chron + redis |
| **Native deploy + diff** | `deployCommands` without any library bridge | `@stratum/rest` (done — extend guild sync) |
| **Transport-agnostic Sequences** | `runSequence` over REST interactions (not bridge-tied) | `@stratum/core` + `@stratum/rest` |
| **Observability bundle** | Prometheus + Influx + structured command audit epilogues | `@stratum/metrics` family |
| **Cross-runtime pieces** | Same bot folder on Node/Bun; workers on Node | `@stratum/runtime` (done — document limits) |

### Highest-impact originals to prioritize

1. **`runSequence` native** — finish Sequences (biggest Sapphire parity gap after declarative options).
2. **Distributed cooldown + Chron** — required for honest multi-worker production.
3. **Vault-driven guild config** — moderation levels, prefixes, feature flags in one system.
4. **Reshard barrier** — operational safety large bots feel immediately.

---

## Suggested release sequencing

```text
1.0.0  — Native stack stable API, docs, examples/bot, known gaps documented
       │
1.x    — Bugfixes, redis cache, declarative gates (B1), permission levels (C1)
       │
2.0.0  — Breaking only if needed: CommandOptions expansion, bus abstraction,
         bundled gateway (A5), native runSequence, distributed chron/cooldown
```

### Dependency graph

```mermaid
flowchart TD
  A1[Redis cache] --> A3[RabbitMQ bus]
  A2[Redis cooldown] --> A3
  B1[Declarative gates] --> B3[Help system]
  C1[Permission levels] --> C2[Vault levels]
  A5[Native WS gateway] --> A3
  B1 --> D1[Native runSequence]
  A2 --> D2[Distributed Chron]
  C2 --> D3[Vault Sequences]
```

---

## Explicit non-goals (v2)

- Re-introducing `@stratum/bridge-*` packages
- 1:1 Sapphire plugin compatibility layer or `@stratum/plugin-*` package names
- Bundling official extensions inside the core monorepo (use **`stratumdev/plugins`** instead)
- 1:1 Discordeno API surface inside core
- Requiring Redis/RabbitMQ/Influx for single-process bots (always optional drivers)
- Class-only **or** function-only pieces — both stay supported

---

## Open questions (decide before implementation)

1. **Package naming:** `@stratum/bus-rabbit` vs optional deps in `@stratum/gateway`?
2. **Permission levels default ladder:** Match Klasa exactly or Discord permission-bit derived only?
3. **Influx vs Prometheus:** Dual export forever, or Influx only for gateway ops?
4. **2.0 breaking changes:** Auto-gates from options — merge order with manual `gates[]`?
5. **Bundled gateway:** In `@stratum/gateway` or separate `@stratum/gateway-ws`?
6. **Plugins org/repo name:** `stratumdev/plugins` vs another GitHub org — decide before first publish.

---

## Official extensions monorepo (plugins repo)

Separate Git repo ([ADR 003](./adr/003-plugins-monorepo.md)), same role as [sapphiredev/plugins](https://github.com/sapphiredev/plugins).

| Package | Purpose |
|---------|---------|
| `@stratum/dashboard` | HTTP + OAuth2 + Vault routes for web dashboards (Pillar E) |
| `@stratum/i18n` | Locale files, command/help translation |
| `@stratum/cron` | Distributed scheduled tasks (pairs with Redis lock in core) |
| `@stratum/dev-reload` | Dev-only piece hot reload |
| `@stratum/editable-commands` | Owner-editable command text (if pursued) |

**Core repo keeps:** `@stratum/plugins` (host only). **Install:** `pnpm add @stratum/dashboard` from npm; register with `attachPlugins()` like any bot-local plugin.

---

## Related

- [roadmap.md](./roadmap.md) — feature matrix (phases 1–21)
- [adr/003-plugins-monorepo.md](./adr/003-plugins-monorepo.md) — repo split + naming
- [phases.md](./phases.md) — completed work
- [adr/002-bridge-deprecation.md](./adr/002-bridge-deprecation.md) — native stack direction
