import { Epilogue, isOk, type EpilogueContext, type Registry } from "@stratum/core";

export class AuditEpilogue extends Epilogue {
  constructor(registry: Registry<Epilogue>) {
    super(registry, {
      name: "audit",
      runOn: "always",
      priority: 100,
    });
  }

  async run(ctx: EpilogueContext): Promise<void> {
    const status = isOk(ctx.outcome) ? "ok" : "fail";
    console.log(`[epilogue:audit] ${ctx.commandName} ${status} (${ctx.durationMs.toFixed(1)}ms)`);
  }
}
