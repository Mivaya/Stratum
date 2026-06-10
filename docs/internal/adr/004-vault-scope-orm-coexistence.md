# ADR 004 — Vault scope and ORM coexistence

**Status:** Accepted  
**Date:** 2026-05-29

## Context

Stambha ships **`@stambha/vault`** — Ledger / Blueprint / Record with pluggable **VaultDriver** backends. Production bots (including Sapphire migrations) often already use **Prisma, Drizzle, or raw SQL** for domain data: economy, quests, achievements, analytics, and complex relational models.

We considered positioning Vault as a full ORM replacement (mod logs, leaderboards, all persistence). Legacy bots sometimes stored config and mod cases in document-oriented “settings” layers; that works for small bots but breaks down at scale (embedded arrays, ad-hoc driver escapes, parallel side stores for XP). Path B keeps Vault honest and shippable.

## Decision

**Path B — Vault = settings + bot-shaped data only.**

1. **Vault owns** schema-first persistence for:
   - Guild / user / member **config** (prefix, channels, toggles, module flags)
   - **Feature flags** and dashboard-editable bot settings
   - **Permission level overrides** (with `@stambha/levels`, 1.x C2)
   - Small **bot-shaped** documents: per-member XP/points when modeled as ledgers (not full economy engines)

2. **ORM / SQL owns** heavy domain:
   - Transactions, inventories, shops, quest graphs
   - Moderation **history at scale** (case tables, audit queries) when not using dedicated log ledgers later
   - Analytics, reporting, ad-hoc SQL

3. **Coexistence is official**, not a migration failure:
   - `loadPieces(client, { context: { vault, prisma } })` (or equivalent binder) is the recommended production pattern when both are needed.

4. **Explicit non-goals for Vault:**
   - Replacing Prisma/Drizzle for arbitrary relational domains
   - Arbitrary SQL joins or a general query planner inside `@stambha/vault`
   - “No database” — drivers still use SQLite, PostgreSQL, MongoDB, or Redis under the hood

5. **Drivers:** `@stambha/vault-sql` and future `vault-redis` / `vault-mongo` ship from [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins) ([ADR 003](./003-plugins-monorepo.md)); Vault API remains in core with `MemoryDriver` for tests.

## Consequences

- **Positive:** Honest positioning; faster 1.0; migrations keep existing Prisma schemas.
- **Positive:** Vault differentiates on config DX + dashboard + levels + sequences — not competing with Prisma on every table.
- **Negative:** Bots must learn two persistence boundaries (Vault zone vs ORM zone).
- **Docs:** Public [Vault guide](../../features/vault.md) explains why both exist; [roadmap.md](../roadmap.md) and [future-v2.md](../future-v2.md) align pillars C2/E3 with Path B only.

## Related

- [roadmap.md](../roadmap.md) — Vault 1.x scope
- [future-v2.md](../future-v2.md) — Pillar C2, E3
