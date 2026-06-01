import type { Command } from "@stratum/core";
import { buildApplicationCommands, diffApplicationCommands } from "@stratum/core";
import type { CreateApplicationCommand } from "@discordeno/bot";
import type { StratumBot } from "./createStratumDiscordenoBot.js";

export interface DeployCommandsOptions {
  bot: StratumBot;
  guildId?: string;
  commands: Iterable<Command>;
  dryRun?: boolean;
  diff?: boolean;
}

export interface DeployCommandsResult {
  count: number;
  guildId?: string;
  global: boolean;
  diff?: { added: string[]; removed: string[]; updated: string[] };
}

async function fetchExisting(
  bot: StratumBot,
  guildId?: string,
): Promise<{ name: string }[]> {
  try {
    if (guildId) {
      const cmds = await bot.helpers.getGuildApplicationCommands(BigInt(guildId));
      return cmds.map((c) => ({ name: c.name }));
    }
    const cmds = await bot.helpers.getGlobalApplicationCommands();
    return cmds.map((c) => ({ name: c.name }));
  } catch {
    return [];
  }
}

/** Sync slash command metadata to Discord (no CLI — call from code or a script). */
export async function deployCommands(options: DeployCommandsOptions): Promise<DeployCommandsResult> {
  const payload = buildApplicationCommands(options.commands);
  const body = payload as CreateApplicationCommand[];

  let diffResult: DeployCommandsResult["diff"];
  if (options.diff && !options.dryRun) {
    const existing = await fetchExisting(options.bot, options.guildId);
    diffResult = diffApplicationCommands(existing, payload);
  } else if (options.diff && options.dryRun) {
    diffResult = diffApplicationCommands([], payload);
  }

  if (options.dryRun) {
    const result: DeployCommandsResult = {
      count: body.length,
      global: !options.guildId,
    };
    if (options.guildId !== undefined) result.guildId = options.guildId;
    if (diffResult !== undefined) result.diff = diffResult;
    return result;
  }

  if (options.guildId) {
    await options.bot.helpers.upsertGuildApplicationCommands(options.guildId, body);
    return {
      count: body.length,
      guildId: options.guildId,
      global: false,
      ...(diffResult !== undefined ? { diff: diffResult } : {}),
    };
  }

  await options.bot.helpers.upsertGlobalApplicationCommands(body);
  return {
    count: body.length,
    global: true,
    ...(diffResult !== undefined ? { diff: diffResult } : {}),
  };
}
