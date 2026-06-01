import type { Command } from "@stratum/core";
import { REST, Routes } from "discord.js";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

export interface DeployCommandsOptions {
  token: string;
  clientId: string;
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
  const body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

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

  const rest = new REST({ version: "10" }).setToken(options.token);

  if (options.guildId) {
    await rest.put(Routes.applicationGuildCommands(options.clientId, options.guildId), {
      body,
    });
    return { count: body.length, guildId: options.guildId, global: false };
  }

  await rest.put(Routes.applicationCommands(options.clientId), { body });
  return { count: body.length, global: true };
}

/** @deprecated Use {@link deployCommands} */
export const deployDirectives = deployCommands;

/** @deprecated Use {@link DeployCommandsOptions} */
export type DeployDirectivesOptions = DeployCommandsOptions;

/** @deprecated Use {@link DeployCommandsResult} */
export type DeployDirectivesResult = DeployCommandsResult;
