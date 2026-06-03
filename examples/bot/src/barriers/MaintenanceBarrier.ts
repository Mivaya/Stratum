import { Barrier, type BarrierResult, type CommandContext, type Registry } from "@stambha/core";

export class MaintenanceBarrier extends Barrier {
  constructor(registry: Registry<Barrier>) {
    super(registry, {
      name: "maintenance",
      priority: 10,
      skipOnHelp: true,
    });
  }

  async block(_ctx: CommandContext): Promise<BarrierResult> {
    if (process.env.MAINTENANCE === "1") {
      return { block: true, reason: "Bot is under maintenance. Try again later." };
    }
    return { block: false };
  }
}
