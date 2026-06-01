import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import type { StratumClient } from "@stratum/core";

export class HelpCommand extends Command {
  constructor(
    registry: Registry<Command>,
    private readonly client: StratumClient,
  ) {
    super(registry, {
      name: "help",
      description: "List commands by category",
      kinds: ["slash", "prefix"],
      category: "General",
    });
  }

  static create(ctx: { client: StratumClient }) {
    return new HelpCommand(ctx.client.registries.commands, ctx.client);
  }

  async execute(ctx: CommandContext) {
    const byCategory = this.client.commandIndex.byCategory(this.client.registries.commands.values());
    const lines: string[] = ["**Stratum commands**"];

    for (const [category, commands] of [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const names = commands
        .filter((c) => c.name !== "help")
        .map((c) => {
          const alias = c.aliases[0] ? ` (${c.aliases[0]})` : "";
          return `\`${c.name}\`${alias}`;
        })
        .join(", ");
      if (names) lines.push(`**${category}:** ${names}`);
    }

    await ctx.reply(lines.join("\n"));
    return ok(undefined);
  }
}
