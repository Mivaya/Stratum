import { Command, ok, type CommandContext, type Registry } from "@stratum/core";

export class HelpCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "help",
      description: "List available commands",
      kinds: ["prefix", "slash"],
      category: "General",
    });
  }

  async execute(ctx: CommandContext) {
    const names = [...this.client.registries.commands.values()]
      .map((cmd) => cmd.name)
      .sort()
      .join(", ");

    await ctx.reply(`Commands: ${names}`);
    return ok(names);
  }
}
