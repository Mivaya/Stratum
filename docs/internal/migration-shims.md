# Migration shims — deprecated app-layer patterns

> **Policy (ADR 005):** Official Stambha migrations are **native-only** (`@stambha/rest`, `@stambha/gateway`, `@stambha/transform`). The hybrid discord.js patterns below are **historical** — documented so maintainers recognize them in early adopters and know what to delete. Do not add new shims; do not document hybrid flows in public guides.

When migrating a **production Sapphire** bot to Stambha, early adopters sometimes added a `lib/stambha/` layer. This internal doc maps those patterns to framework gaps and **native replacements**.

---

## Shim → framework mapping

| App-layer pattern | What it compensated for | Native replacement | Status |
|-------------------|-------------------------|-------------------|--------|
| **Bootstrap `setup.ts`** | Orchestrates bot, loader, hub, deploy, DB init | `examples/bot` native bootstrap (**0.3.0 N2**) | Replace with reference example |
| **Custom `attach*Client`** | Dynamic guild prefix; legacy run methods | `resolvePrefix` on gateway attach (**0.2.2 P2**); rewrite to `execute(ctx)` | **P2** ships; no `preserveRaw` |
| **`wire*ToHub` / `attachDiscordJsGateway`** | discord.js events → `GatewayEventHub` | Bundled WS gateway (**0.3.0 N1**) or manual `hub.emit` until N1 | **Cancelled** — do not ship helpers |
| **Service locator `container`** | Sapphire `container` (prisma, logger, …) | `client.container.binder` + plugins (**0.3.0 N3**) | In progress |
| **`LegacyArgs`** | Sapphire `Args.pick` for `messageRun` | `Args.fromContext` + **1.x B2** | Migrate commands to `execute(ctx)` |
| **`LegacySlashRegistry`** | `SlashCommandBuilder` + custom deploy | `deployCommands` + declarative slash (**1.x B1**) | Use Stambha `Command` metadata |
| **`fetchGuildPrefix` helper** | Per-guild prefix from database | **0.2.2 P2** resolver; **1.x C2** Vault prefix field | Resolver or Vault |
| **Gate `appliesTo(command)` filter** | Global gates on every command | **0.2.2 P1** — `gateNames` on `Command` | Use per-command gate names |
| **Hook base with `container` getter** | Hooks only receive `registry` | **0.3.0 N3** — `Hook.create(ctx)` factory | Binder injection |
| **`RouteStub` + unwired `routes/`** | `@sapphire/plugin-api` | **Plugins E** — `@stambha/dashboard` | Dashboard plugin |
| **Prisma for all data + no Vault** | Guild config in SQL | **1.x C2** — Vault for settings ([ADR 004](./adr/004-vault-scope-orm-coexistence.md)) | Keep Prisma for domain |
| **Command base with `messageRun` / `chatInputRun`** | Legacy run methods | Rewrite to `execute(ctx)` | No framework `preserveRaw` |
| **Weak `HotLoader`** | Sapphire store reload | **Plugins** — `@stambha/dev-reload` | Dev-reload plugin |

---

## Historical hybrid bootstrap (do not use)

Early migrations kept **discord.js** for sharding while routing commands through Stambha. **Not supported** per ADR 005:

```text
1. createStambhaBot({ restPort, prefix: default })
2. loadPieces(client, { context: { prisma, … } })
3. createGatewayEventHub()
4. attach*Client(hub, client, { resolvePrefix, preserveRaw: true })  // cancelled
5. wire discord.js Client → hub
6. discord.login()
```

**Native flow** (public docs): `createStambhaBot` → `loadPieces` → `GatewayEventHub` + native shard WS (or tier split) → `client.start()` → `deployCommands`. See [from-sapphire.md](../migration/from-sapphire.md).

---

## Dashboard routes (unwired)

Migrating bots with `@sapphire/plugin-api` often kept `src/routes/**` as stubs until a dashboard plugin exists.

**Owner:** [future-v2.md](./future-v2.md) Pillar E — `@stambha/dashboard` (ADR 003). Not core Stambha.

---

## What adopters should not expect in core

Per [adr/002-bridge-deprecation.md](./adr/002-bridge-deprecation.md) and [adr/005-native-only-migration.md](./adr/005-native-only-migration.md):

- No `@stambha/bridge-discordjs` package
- No `attachDiscordJsGateway` or `preserveRaw` migration helpers
- No 1:1 Sapphire plugin names (`@stambha/plugin-api`)
- Core never imports discord.js

---

## Checklist for deleting app shims

### After 0.2.2

- [ ] Remove gate `appliesTo` filter; use `gateNames` on commands
- [ ] Replace custom prefix logic with `resolvePrefix` on gateway attach
- [ ] Fix loader to load gates before commands (or use framework resolver)

### After 0.3.0

- [ ] Remove discord.js gateway wiring; use bundled WS client or tier split
- [ ] Align bootstrap with native `examples/bot`
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

- [release-plan.md](./release-plan.md) — 0.2.2 / 0.3.0 ticket IDs
- [future-v2.md](./future-v2.md) — 1.x / 2.0 pipeline
- [../migration/from-sapphire.md](../migration/from-sapphire.md) — public native migration guide
