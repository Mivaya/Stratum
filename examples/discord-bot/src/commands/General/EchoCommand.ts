import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import { Args, replyIfArgError, stringArg } from "@stratum/args";

/** Demo prefix args: `!echo hello` or `!echo square 5` */
export class EchoCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "echo",
      description: "Echo text or square a number (args demo)",
      kinds: ["prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    const args = Args.fromContext(ctx);

    if (args.finished) {
      await ctx.reply("Usage: `!echo <text>` or `!echo square <n>`");
      return ok(undefined);
    }

    const first = args.pick(stringArg);
    if (await replyIfArgError(ctx, first)) return ok(undefined);

    if (first.value === "square") {
      const n = args.pickType("integer");
      if (await replyIfArgError(ctx, n)) return ok(undefined);
      if (n.ok) await ctx.reply(String(Number(n.value) ** 2));
      return ok(undefined);
    }

    const tail = args.rest();
    await ctx.reply(tail ? `${first.value} ${tail}` : first.value);
    return ok(undefined);
  }
}
