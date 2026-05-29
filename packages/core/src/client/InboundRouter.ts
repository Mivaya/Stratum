import type { CommandContext, ScoutContext } from "../context/types.js";
import type { Outcome } from "../outcome/Outcome.js";
import type { StratumClient } from "./StratumClient.js";

/**
 * Transport-agnostic inbound routing: scouts, then prefix command detection.
 * Bridge packages call these methods with normalized contexts.
 */
export class InboundRouter {
  constructor(readonly client: StratumClient) {}

  async processScout(ctx: ScoutContext): Promise<void> {
    await this.client.pipeline.runScouts(ctx);
  }

  /**
   * Parse prefix command from message content. Returns null if not a command.
   */
  parsePrefixCommand(content: string): { name: string; args: string } | null {
    const prefix = this.client.prefix;
    if (!content.startsWith(prefix)) return null;

    const body = content.slice(prefix.length).trim();
    if (!body) return null;

    const [name, ...rest] = body.split(/\s+/);
    if (!name) return null;

    return { name: name.toLowerCase(), args: rest.join(" ") };
  }

  async processPrefixCommand(ctx: CommandContext): Promise<Outcome<unknown, unknown> | null> {
    if (ctx.kind !== "prefix") return null;
    const command = this.client.getCommand(ctx.commandName);
    if (!command?.supports("prefix")) return null;
    return this.client.invoke(ctx.commandName, ctx);
  }

  async processSlashCommand(ctx: CommandContext): Promise<Outcome<unknown, unknown>> {
    return this.client.invoke(ctx.commandName, ctx);
  }
}
