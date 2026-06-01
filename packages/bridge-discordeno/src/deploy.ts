import type { Command } from "@stratum/core";
import type { CreateApplicationCommand } from "@discordeno/bot";
import type { StratumBot } from "./createStratumDiscordenoBot.js";

export interface DeployCommandsOptions {
  bot: StratumBot;
  guildId?: string;
  commands: Iterable<Command>;
  dryRun?: boolean;
}

export interface DeployCommandsResult {
  count: number;
  guildId?: string;
  global: boolean;
}

/** Sync slash command metadata to Discord (no CLI — call from code or a script). */
export async function deployCommands(options: DeployCommandsOptions): Promise<DeployCommandsResult> {
  const body: CreateApplicationCommand[] = [];

  for (const command of options.commands) {
    if (!command.enabled || !command.kinds.includes("slash")) continue;
    body.push({
      name: command.name,
      description: command.description.slice(0, 100) || command.name,
      type: 1,
    });
  }

  if (options.dryRun) {
    const result: DeployCommandsResult = {
      count: body.length,
      global: !options.guildId,
    };
    if (options.guildId !== undefined) result.guildId = options.guildId;
    return result;
  }

  if (options.guildId) {
    await options.bot.helpers.upsertGuildApplicationCommands(options.guildId, body);
    return { count: body.length, guildId: options.guildId, global: false };
  }

  await options.bot.helpers.upsertGlobalApplicationCommands(body);
  return { count: body.length, global: true };
}
