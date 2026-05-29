import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import type { Vault } from "@stratum/vault";

export class PrefixCommand extends Command {
  constructor(
    registry: Registry<Command>,
    private readonly vault: Vault,
  ) {
    super(registry, {
      name: "prefix",
      description: "Show or set the guild command prefix (Vault demo)",
      kinds: ["slash", "prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    if (!ctx.guildId) {
      await ctx.reply("This command only works in a server.");
      return ok(undefined);
    }

    const record = this.vault.ledger("guild").acquire(ctx.guildId);
    await record.sync();

    const args = (ctx.raw as { options?: { getString?: (n: string) => string | null } })?.options;
    const newPrefix = args?.getString?.("value") ?? null;

    if (newPrefix) {
      record.set("prefix", newPrefix);
      await record.save();
      await ctx.reply(`Prefix set to \`${newPrefix}\``);
      return ok(undefined);
    }

    await ctx.reply(`Current prefix: \`${record.get("prefix")}\``);
    return ok(undefined);
  }
}
