import { Signal, type Registry, type SignalContext } from "@stratum/core";

export class ConfirmSignal extends Signal {
  constructor(registry: Registry<Signal>) {
    super(registry, { name: "confirm", types: ["button"] });
  }

  async run(ctx: SignalContext) {
    await ctx.reply("Confirmed!");
  }
}
