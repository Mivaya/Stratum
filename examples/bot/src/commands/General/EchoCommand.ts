import { Args, replyIfArgError, stringArg, unwrapArg } from "@stratum/args";
import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import { cooldownGate, guildOnlyGate } from "@stratum/gates";

export class EchoCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "echo",
      description: "Repeat your message",
      kinds: ["prefix"],
      category: "General",
      gates: [guildOnlyGate(), cooldownGate({ limit: 1, delay: 2_000, scope: "user" })],
    });
  }

  async execute(ctx: CommandContext) {
    const args = Args.fromContext(ctx);
    const picked = args.pick(stringArg);
    if (await replyIfArgError(ctx, picked)) return ok(undefined);

    const text = unwrapArg(picked);
    if (!text) {
      await ctx.reply("Usage: `!echo <message>`");
      return ok(undefined);
    }

    await ctx.reply(text);
    return ok(text);
  }
}
