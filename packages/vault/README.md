# @stambha/vault

**Schema-driven settings** — Blueprint + Ledger + Record for typed guild, user, and channel persistence. Klasa-style settings without a framework lock-in.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha) · [Vault guide](https://github.com/mivaya/Stambha/tree/main/docs/features/vault.md)

---

## Install

```bash
npm install @stambha/vault @stambha/core
```

For SQLite/PostgreSQL backends, add [`@stambha/vault-sql`](../vault-sql).

Requires **Node.js 20+**.

---

## Quick start

### Define a blueprint

```ts
import { defineBlueprint, field } from "@stambha/vault";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!").build(),
  modLogChannel: field.string().nullable().default(null).build(),
});
```

### Open a vault

```ts
import { Vault, MemoryDriver } from "@stambha/vault";
import { GuildBlueprint } from "./schemas/GuildBlueprint.js";

const vault = new Vault({ driver: new MemoryDriver(), debounceMs: 400 });
vault.registerLedger("guild", { blueprint: GuildBlueprint });
await vault.init();
```

### Read and write settings

```ts
const record = vault.ledger("guild").acquire(guildId);
await record.sync();

record.set("prefix", "?");
await record.save();

const prefix = record.get("prefix");
```

Pass `vault` to `@stambha/loader` context so schema pieces can access it.

---

## Concepts

| Type | Role |
|------|------|
| **Blueprint** | Schema + defaults for a settings document |
| **Ledger** | Namespace (`forGuild`, `forUser`, `forChannel`) |
| **Record** | Loaded document with typed `get` / `update` |
| **VaultDriver** | Storage backend (`MemoryDriver`, SQL via vault-sql) |

---

## Key exports

| Export | Purpose |
|--------|---------|
| `Vault` | Top-level settings API |
| `Ledger` | Per-entity record access |
| `Blueprint`, `defineBlueprint`, `field` | Schema definition |
| `VaultRecord` / `Record` | Typed document |
| `MemoryDriver` | In-memory dev/test driver |
| `SyncBatcher` | Batch writes to the driver |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/vault-sql`](../vault-sql) | SQLite and PostgreSQL drivers |
| [`@stambha/loader`](../loader) | Load schemas from `src/schemas/` |
| [`@stambha/core`](../core) | Inject vault into commands |

---

## Development

```bash
pnpm --filter @stambha/vault build
pnpm --filter @stambha/vault test
```
