import { Command, ok, type CommandContext, type Registry } from "@stratum/core";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Replies with pong",
      kinds: ["slash", "prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong! (Discordeno bridge)");
    return ok(undefined);
  }
}
