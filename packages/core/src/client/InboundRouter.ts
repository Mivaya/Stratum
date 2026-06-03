import type { CommandContext, ScoutContext } from "../context/types.js";
import type { CommandSlashPath } from "../command/slashTypes.js";
import type { Outcome } from "../outcome/Outcome.js";
import type { StambhaClient } from "./StambhaClient.js";

/**
 * Transport-agnostic inbound routing: scouts, then prefix command detection.
 * Bridge packages call these methods with normalized contexts.
 */
export class InboundRouter {
  constructor(readonly client: StambhaClient) {}

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

    const resolved = this.client.commandIndex.resolvePrefixName(name.toLowerCase());
    return { name: resolved, args: rest.join(" ") };
  }

  async processPrefixCommand(ctx: CommandContext): Promise<Outcome<unknown, unknown> | null> {
    if (ctx.kind !== "prefix") return null;
    const command = this.client.getCommand(ctx.commandName);
    if (!command?.supports("prefix")) return null;
    return this.client.invoke(ctx.commandName, ctx);
  }

  async processSlashCommand(ctx: CommandContext): Promise<Outcome<unknown, unknown>> {
    const path: CommandSlashPath = ctx.slashPath ?? { root: ctx.commandName };
    const command = this.client.commandIndex.resolveSlash(path);
    if (!command) {
      return { ok: false, error: new Error(`Unknown slash command: ${path.root}`) };
    }
    return this.client.invoke(command.name, ctx);
  }
}
