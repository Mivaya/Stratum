import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import type { LoaderContext } from "@stratum/loader";
import type { Vault } from "@stratum/vault";

export class ConfigCommand extends Command {
  static create(ctx: LoaderContext) {
    const vault = ctx.vault as Vault;
    return new ConfigCommand(ctx.client.registries.commands, vault);
  }

  constructor(
    registry: Registry<Command>,
    private readonly vault: Vault,
  ) {
    super(registry, {
      name: "config",
      description: "Show guild settings from Vault",
      kinds: ["prefix", "slash"],
      category: "General",
    });
  }

  async execute(ctx: CommandContext) {
    if (!ctx.guildId) {
      await ctx.reply("Guild-only command.");
      return ok(undefined);
    }

    const record = this.vault.ledger("guild").acquire(ctx.guildId);
    await record.sync();

    const prefix = record.get("prefix");
    const welcome = record.get("welcomeEnabled");

    await ctx.reply(`Prefix: \`${prefix}\` · Welcome messages: ${welcome ? "on" : "off"}`);
    return ok({ prefix, welcome });
  }
}
