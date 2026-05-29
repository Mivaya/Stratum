import type { SignalContext } from "../context/SignalContext.js";
import { Signal, type SignalType } from "../registries/Signal.js";
import type { StratumClient } from "./StratumClient.js";

export class SignalRouter {
  constructor(readonly client: StratumClient) {}

  async dispatch(ctx: SignalContext, type: SignalType): Promise<boolean> {
    const signal = this.client.registries.signals.get(ctx.signalName);
    if (!signal?.enabled || !signal.supports(type)) return false;

    try {
      await signal.run(ctx);
      return true;
    } catch (error) {
      this.client.emit("signalError", { signal: signal.name, error, ctx });
      return true;
    }
  }

  static parseCustomId(customId: string) {
    return Signal.parseCustomId(customId);
  }
}
