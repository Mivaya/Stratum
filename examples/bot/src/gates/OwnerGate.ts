import { Gate, type CommandContext, type GateResult, type Registry } from "@stambha/core";

/** Enabled when `ENFORCE_OWNER=1` — blocks non-owners globally. */
export class OwnerGate extends Gate {
  constructor(registry: Registry<Gate>) {
    super(registry, { name: "owner-only", priority: 5 });
  }

  async check(ctx: CommandContext): Promise<GateResult> {
    if (process.env.ENFORCE_OWNER !== "1") return { allow: true };

    const ownerId = process.env.OWNER_ID;
    if (!ownerId) return { allow: true };

    if (ctx.userId === ownerId) return { allow: true };
    return { allow: false, reason: "This bot is in owner-only mode." };
  }
}
