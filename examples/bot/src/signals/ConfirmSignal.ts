import { Signal, type Registry, type SignalContext } from "@stratum/core";

export class ConfirmSignal extends Signal {
  constructor(registry: Registry<Signal>) {
    super(registry, {
      name: "confirm",
      types: ["button"],
    });
  }

  async run(ctx: SignalContext): Promise<void> {
    const parsed = Signal.parseCustomId(ctx.customId);
    const action = parsed?.suffix || "unknown";
    await ctx.reply(`Confirmed: \`${action}\``);
  }
}
