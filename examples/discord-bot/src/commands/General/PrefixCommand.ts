import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import type { Vault } from "@stratum/vault";
import type { LoaderContext } from "@stratum/loader";

export class PrefixCommand extends Command {
  static create(ctx: LoaderContext) {
    if (!ctx.vault) throw new Error("PrefixCommand requires vault in loader context.");
    return new PrefixCommand(ctx.client.registries.commands, ctx.vault as Vault);
  }

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
