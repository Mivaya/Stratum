import { Command, ok, type CommandContext, type Registry } from "@stambha/core";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Replies with pong",
      kinds: ["slash", "prefix"],
      category: "General",
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
