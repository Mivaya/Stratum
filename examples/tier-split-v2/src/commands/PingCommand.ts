import { Command, ok, type CommandContext, type Registry } from "@stratum/core";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Replies with pong (tier split v2 — gateway relay + bot worker)",
      kinds: ["slash", "prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong! (bot worker via gateway relay + REST worker)");
    return ok(undefined);
  }
}
