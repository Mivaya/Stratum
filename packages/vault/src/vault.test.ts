import { describe, expect, it } from "vitest";
import { defineBlueprint, field, MemoryDriver, Vault } from "./index.js";

const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!"),
  modLogChannel: field.string().nullable().default(null),
});

describe("Vault", () => {
  it("applies defaults and persists via driver", async () => {
    const vault = new Vault({ driver: new MemoryDriver(), debounceMs: 10 });
    vault.registerLedger("guild", { blueprint: GuildBlueprint });
    await vault.init();

    const record = vault.ledger("guild").acquire("guild-1");
    await record.sync();

    expect(record.get("prefix")).toBe("!");
    record.set("prefix", "?");
    await record.save();

    const again = vault.ledger("guild").acquire("guild-2");
    await again.sync();
    again.set("prefix", ".");
    await vault.flush();

    const reloaded = vault.ledger("guild").acquire("guild-2");
    await reloaded.sync(true);
    expect(reloaded.get("prefix")).toBe(".");
  });

  it("validates number bounds", () => {
    const LevelBlueprint = defineBlueprint({
      xp: field.number().min(0).default(0),
    });

    expect(() => LevelBlueprint.validate({ xp: -1 })).toThrow();
  });

  it("resets to defaults", async () => {
    const vault = new Vault({ driver: new MemoryDriver() });
    vault.registerLedger("guild", { blueprint: GuildBlueprint });
    await vault.init();

    const record = vault.ledger("guild").acquire("g1");
    await record.sync();
    record.set("prefix", "??");
    await record.save();
    await record.reset("prefix");
    expect(record.get("prefix")).toBe("!");
  });
});
