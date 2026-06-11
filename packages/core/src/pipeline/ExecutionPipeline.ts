import { isOk, type Outcome, StambhaError } from "../outcome/Outcome.js";
import type { CommandContext, EpilogueContext, ScoutContext } from "../context/types.js";
import type { StambhaClient } from "../client/StambhaClient.js";
import type { Command } from "../registries/Command.js";
import { commandGatesForRun } from "../gates/resolveCommandGates.js";

export interface PipelineRunOptions {
  /** Skip barriers marked skipOnHelp (e.g. rate limits while listing commands). */
  helpMode?: boolean;
}

export class ExecutionPipeline {
  constructor(readonly client: StambhaClient) {}

  async runScouts(ctx: ScoutContext): Promise<void> {
    const botUserId = this.client.botUserId;
    const scouts = this.client.registries.scouts.sortedByPriority((s) => s.priority);

    const serial: typeof scouts = [];
    const parallel: typeof scouts = [];

    for (const scout of scouts) {
      if (!scout.shouldRun(ctx, botUserId)) continue;
      if (scout.concurrency === "serial") serial.push(scout);
      else parallel.push(scout);
    }

    for (const scout of serial) {
      await this.runScoutSafe(scout, ctx);
    }

    await Promise.all(parallel.map((scout) => this.runScoutSafe(scout, ctx)));
  }

  private async runScoutSafe(
    scout: import("../registries/Scout.js").Scout,
    ctx: ScoutContext,
  ): Promise<void> {
    try {
      await scout.run(ctx);
    } catch (error) {
      this.client.emit("scoutError", { scout: scout.name, error, ctx });
    }
  }

  async runCommand(
    command: Command,
    ctx: CommandContext,
    options: PipelineRunOptions = {},
  ): Promise<Outcome<unknown, unknown>> {
    const start = performance.now();

    await this.runConduits(ctx);

    const blocked = await this.runBarriers(ctx, options);
    if (blocked) {
      const payload: {
        ctx: CommandContext;
        reason?: string;
        silent?: boolean;
      } = { ctx };
      if (blocked.reason !== undefined) payload.reason = blocked.reason;
      if (blocked.silent !== undefined) payload.silent = blocked.silent;
      this.client.emit("commandBlocked", payload);
      return {
        ok: false,
        error: new StambhaError(blocked.reason ?? "Blocked.", "BARRIER"),
      };
    }

    const denied = await this.runGates(command, ctx);
    if (denied) {
      this.client.emit("commandDenied", { ctx, error: denied });
      return { ok: false, error: denied };
    }

    let outcome: Outcome<unknown>;
    try {
      outcome = await command.execute(ctx);
    } catch (error) {
      outcome = {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }

    const durationMs = performance.now() - start;
    await this.runEpilogues({
      commandName: command.name,
      ctx,
      outcome,
      durationMs,
    });

    if (isOk(outcome)) {
      this.client.emit("commandSuccess", { ctx, command: command.name, durationMs });
    } else {
      this.client.emit("commandError", { ctx, command: command.name, error: outcome.error });
    }

    return outcome;
  }

  private async runConduits(ctx: CommandContext): Promise<void> {
    const conduits = this.client.registries.conduits.sortedByPriority((c) => c.priority);
    for (const conduit of conduits) {
      await conduit.process(ctx);
    }
  }

  private async runBarriers(
    ctx: CommandContext,
    options: PipelineRunOptions,
  ): Promise<{ reason?: string; silent?: boolean } | null> {
    const barriers = this.client.registries.barriers.sortedByPriority((b) => b.priority);

    const checks = barriers
      .filter((b) => !(options.helpMode && b.skipOnHelp))
      .map((b) => b.block(ctx));

    const results = await Promise.all(checks);

    for (const result of results) {
      if (result.block) {
        const blocked: { reason?: string; silent?: boolean } = {};
        if (result.reason !== undefined) blocked.reason = result.reason;
        if (result.silent !== undefined) blocked.silent = result.silent;
        return blocked;
      }
    }
    return null;
  }

  private async runGates(
    command: Command,
    ctx: CommandContext,
  ): Promise<{ message: string; silent: boolean; gate: string } | null> {
    for (const gate of commandGatesForRun(this.client, command)) {
      const result = await gate.check(ctx);
      if (!result.allow) {
        return {
          message: result.reason ?? "Gate denied.",
          silent: result.silent ?? false,
          gate: gate.name,
        };
      }
    }
    return null;
  }

  private async runEpilogues(epilogueCtx: EpilogueContext): Promise<void> {
    const epilogues = this.client.registries.epilogues.sortedByPriority((e) => e.priority);
    const success = isOk(epilogueCtx.outcome);

    for (const epilogue of epilogues) {
      if (!epilogue.matches(success)) continue;
      try {
        await epilogue.run(epilogueCtx);
      } catch (error) {
        this.client.emit("epilogueError", { epilogue: epilogue.name, error, ctx: epilogueCtx });
      }
    }
  }
}
