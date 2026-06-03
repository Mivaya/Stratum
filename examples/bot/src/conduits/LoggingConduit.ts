import { Conduit, type CommandContext, type Registry } from "@stambha/core";

export class LoggingConduit extends Conduit {
  constructor(registry: Registry<Conduit>) {
    super(registry, { name: "logging", priority: 1 });
  }

  async process(ctx: CommandContext): Promise<void> {
    console.log(`[conduit] → ${ctx.commandName} (${ctx.kind}) by ${ctx.userId}`);
  }
}
