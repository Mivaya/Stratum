# Vault (`@stambha/vault`)

Klasa-style **Gateway → Schema → Settings** reimagined as **Ledger → Blueprint → Record**.

## Concepts

| Klasa | Stambha Vault |
|-------|----------------|
| Gateway | **Ledger** |
| Schema | **Blueprint** |
| Settings | **Record** |
| Provider | **VaultDriver** (`MemoryDriver` built-in) |

## Project folders

```text
src/schemas/          # Blueprint definitions (GuildBlueprint.ts)
```

Register ledgers in `main.ts` (piece loader will automate this later).

## Quick start

```ts
import { Vault, MemoryDriver, defineBlueprint, field } from "@stambha/vault";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!"),
  modLogChannel: field.string().nullable().default(null),
});

const vault = new Vault({ driver: new MemoryDriver() });
vault.registerLedger("guild", { blueprint: GuildBlueprint });
await vault.init();

const record = vault.ledger("guild").acquire(guildId);
await record.sync();
record.set("prefix", "?");
await record.save(); // or rely on debounced auto-save from .set()
```

## API highlights

- `record.sync()` — load from driver
- `record.set` / `record.patch` — validate + queue debounced write
- `record.save()` — flush immediately
- `record.reset()` / `record.destroy()`
- `record.pluck("prefix", "modLogChannel")`
- `vault.flush()` — flush all pending writes (call on shutdown)

## Events

```ts
vault.on("recordSync", ({ ledger, id }) => {});
vault.on("recordSave", ({ ledger, id }) => {});
vault.on("recordDelete", ({ ledger, id }) => {});
```

## Phase 3 scope

- [x] Blueprint + field builders
- [x] Memory driver
- [x] Debounced sync batcher
- [ ] SQLite / Postgres drivers (`feature/vault-sql`)
- [ ] Migrations
- [ ] Ledger relations
