# Migration shims — app-layer patterns

When migrating a **production Sapphire + discord.js** bot to Stambha, adopters often add a small `lib/stambha/` (or similar) layer. This document describes **common shim patterns**, what each compensates for in Stambha today, and **which release removes the need for it**.

Stambha is a general framework; these patterns apply to any large Sapphire migration, not a single application.

---

## Shim → framework mapping

| App-layer pattern | What it compensates for | Stambha target | Remove shim when |
|-------------------|-------------------------|----------------|------------------|
| **Bootstrap `setup.ts`** | Orchestrates `createStambhaBot`, `loadPieces`, hub wiring, discord.js login, slash deploy, DB init, client events | **0.3.0** — `examples/hybrid-discordjs` + migration doc | Example copied; app keeps a thin `bootstrap()` wrapper |
| **Custom `attach*Client`** | Dynamic guild prefix; `ctx.raw` = discord.js `Message` / `Interaction`; bypasses static `client.prefix` | **0.2.2 P2–P3** — `resolvePrefix`, `preserveRaw` on gateway attach | Use `@stambha/gateway` attach options |
| **`wire*ToHub`** | Forwards discord.js gateway events into `GatewayEventHub` | **0.3.0 M1** — `attachDiscordJsGateway` | Use official gateway helper |
| **Service locator `container`** | Sapphire `container` (`prisma`, discord client, logger, unwired API server) | **0.3.0 M3** DI docs; **1.x** plugins | `client.container.binder` + plugins |
| **`LegacyArgs`** | Sapphire `Args.pick` / `rest` for `messageRun(message, args)` | **1.x B2** — Args migration helpers in `@stambha/args` | Commands use `execute(ctx)` + `Args.fromContext` |
| **`LegacySlashRegistry` + custom deploy** | `registerApplicationCommands(SlashCommandBuilder)` + REST PUT | **1.x** — `deployCommands` + builder collector or declarative slash tree (**B1**) | Slash metadata on Stambha `Command` or official collector |
| **`fetchGuildPrefix` helper** | Per-guild prefix from database | **0.2.2 P2** resolver hook; **1.x C2** Vault prefix field | Prefix via client resolver or Vault |
| **Gate `appliesTo(command)` filter** | Global gate registry runs on every command; Sapphire only runs listed preconditions | **0.2.2 P1** — per-command `gateNames` in pipeline | Native gate names on `Command` |
| **Hook base with `container` getter** | Hooks only receive `registry` in constructor | **0.3.0 M3** — `Hook.create(ctx)` factory | Binder injection or loader context |
| **`RouteStub` + unwired `routes/`** | `@sapphire/plugin-api` with no Stambha equivalent yet | **Plugins E1–E4** — `@stambha/dashboard` | Dashboard plugin wired |
| **Prisma for all data + no Vault** | Valid during migration; guild config still in SQL | **1.x C2** — Vault for settings only ([ADR 004](./adr/004-vault-scope-orm-coexistence.md)) | Move prefix/modules/flags to Vault; keep Prisma for domain |
| **Command base with `messageRun` / `chatInputRun`** | Legacy run methods forwarded from `execute()` | **0.2.2 P3** + migration guide | Incremental rewrite to `execute(ctx)` |
| **Weak `HotLoader`** | Sapphire store load/unload/reload | **Plugins** — `@stambha/dev-reload` | Dev-reload plugin or registry reload API |

---

## Typical hybrid bootstrap flow

Production bots often keep **discord.js** for sharding, caches, and guild/member APIs while routing commands through Stambha:

```text
1. createStambhaBot({ restPort, prefix: default })
2. loadPieces(client, { context: { prisma, … } })
3. createGatewayEventHub()
4. attach*Client(hub, client, { resolvePrefix, preserveRaw: true })
5. wire discord.js Client → hub (messageCreate, interactionCreate, …)
6. discord.login()
7. on clientReady:
     hub.markReady({ user })
     await client.start()          // binds hooks
     hub.emit('clientReady', djs)  // after start(), so once-hooks fire
     deployCommands on shard 0 only
```

**0.2.2 P5** documents this order in [from-sapphire.md](../migration/from-sapphire.md). **0.3.0 M2** ships a reference implementation.

---

## Dashboard routes (unwired)

Migrating bots with `@sapphire/plugin-api` often:

1. Keep `src/routes/**` on disk for a future dashboard plugin.
2. Replace `Route` imports with a local stub (`RouteStub.ts`).
3. Remove `client.server.connect()` from bootstrap.
4. Exclude routes from `tsc` until `@stambha/dashboard` exists, **or** maintain stubs that typecheck.

**Owner:** [future-v2.md](./future-v2.md) Pillar E — `@stambha/dashboard` in the plugins monorepo (ADR 003). Not core Stambha.

---

## What adopters should not expect in core

Per [adr/002-bridge-deprecation.md](./adr/002-bridge-deprecation.md):

- No `@stambha/bridge-discordjs` package
- No 1:1 Sapphire plugin names (`@stambha/plugin-api`)
- Core never imports discord.js

Hybrid helpers live in **@stambha/gateway** + **@stambha/transform** + docs/examples.

---

## Checklist for deleting app shims

Use after each Stambha release:

### After 0.2.2

- [ ] Remove gate `appliesTo` filter; use `gateNames` on commands
- [ ] Replace custom prefix attach with `resolvePrefix`
- [ ] Enable `preserveRaw` instead of manual `Object.defineProperty(ctx, 'raw', …)`
- [ ] Fix loader to load gates before commands (or use framework resolver)

### After 0.3.0

- [ ] Replace `wire*ToHub` with `attachDiscordJsGateway`
- [ ] Align bootstrap with `examples/hybrid-discordjs`
- [ ] Move `client.on('command*')` to epilogues or documented pattern

### After 1.x (B1, B2, C1)

- [ ] Remove `LegacyArgs`; migrate commands to `execute(ctx)`
- [ ] Remove `LegacySlashRegistry`; use declarative slash or REST collector
- [ ] Replace custom permission gate with `@stambha/levels`

### After plugins (`@stambha/dashboard`)

- [ ] Delete `RouteStub`; wire routes through dashboard plugin
- [ ] Restore route typechecking in `tsconfig`

---

## Related

- [release-plan.md](./release-plan.md) — 0.2.2 / 0.3.0 ticket IDs and full gap matrix
- [future-v2.md](./future-v2.md) — 1.x / 2.0 pipeline
- [../migration/from-sapphire.md](../migration/from-sapphire.md) — public migration guide
