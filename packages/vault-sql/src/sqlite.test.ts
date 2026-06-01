import { describe, expect, it } from "vitest";
import { defineBlueprint, field, Vault } from "@stratum/vault";
import { SQLiteDriver } from "./SQLiteDriver.js";

const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!"),
});

describe("SQLiteDriver", () => {
  it("persists in-memory within one database", async () => {
    const driver = new SQLiteDriver({ path: ":memory:" });
    const vault = new Vault({ driver, debounceMs: 0 });
    vault.registerLedger("guild", { blueprint: GuildBlueprint });
    await vault.init();

    const record = vault.ledger("guild").acquire("g-100");
    await record.sync();
    record.set("prefix", ">");
    await record.save();

    const reloaded = vault.ledger("guild").acquire("g-100");
    await reloaded.sync(true);
    expect(reloaded.get("prefix")).toBe(">");
    driver.close();
  });

  it("survives reopen with file database", async () => {
    const path = `/tmp/stratum-vault-test-${Date.now()}.db`;
    const driver1 = new SQLiteDriver({ path });
    const vault1 = new Vault({ driver: driver1, debounceMs: 0 });
    vault1.registerLedger("guild", { blueprint: GuildBlueprint });
    await vault1.init();
    const r1 = vault1.ledger("guild").acquire("g1");
    await r1.sync();
    r1.set("prefix", "?");
    await r1.save();
    driver1.close();

    const driver2 = new SQLiteDriver({ path });
    const vault2 = new Vault({ driver: driver2, debounceMs: 0 });
    vault2.registerLedger("guild", { blueprint: GuildBlueprint });
    await vault2.init();
    const r = vault2.ledger("guild").acquire("g1");
    await r.sync(true);
    expect(r.get("prefix")).toBe("?");
    driver2.close();
  });
});
