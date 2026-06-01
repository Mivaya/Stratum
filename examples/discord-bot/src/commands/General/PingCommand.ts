import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import { cooldownGate } from "@stratum/gates";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Replies with Pong!",
      kinds: ["slash", "prefix"],
      gates: [cooldownGate({ limit: 3, delay: 5_000, scope: "user" })],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
