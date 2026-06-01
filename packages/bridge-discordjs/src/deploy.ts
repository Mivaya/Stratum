import type { Command } from "@stratum/core";
import { buildApplicationCommands, diffApplicationCommands } from "@stratum/core";
import { REST, Routes } from "discord.js";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

export interface DeployCommandsOptions {
  token: string;
  clientId: string;
  guildId?: string;
  commands: Iterable<Command>;
  dryRun?: boolean;
  /** Log added/removed/updated command names (requires fetch; guild deploy only when guildId set). */
  diff?: boolean;
}

export interface DeployCommandsResult {
  count: number;
  guildId?: string;
  global: boolean;
  diff?: { added: string[]; removed: string[]; updated: string[] };
}

async function fetchExisting(
  rest: REST,
  clientId: string,
  guildId?: string,
): Promise<{ name: string }[]> {
  if (guildId) {
    return rest.get(Routes.applicationGuildCommands(clientId, guildId)) as Promise<{ name: string }[]>;
  }
  return rest.get(Routes.applicationCommands(clientId)) as Promise<{ name: string }[]>;
}

/** Sync slash command metadata to Discord (no CLI — call from code or a script). */
export async function deployCommands(options: DeployCommandsOptions): Promise<DeployCommandsResult> {
  const payload = buildApplicationCommands(options.commands);
  const body = payload as RESTPostAPIChatInputApplicationCommandsJSONBody[];

  let diffResult: DeployCommandsResult["diff"];
  if (options.diff && !options.dryRun) {
    const rest = new REST({ version: "10" }).setToken(options.token);
    const existing = await fetchExisting(rest, options.clientId, options.guildId);
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

  const rest = new REST({ version: "10" }).setToken(options.token);

  if (options.guildId) {
    await rest.put(Routes.applicationGuildCommands(options.clientId, options.guildId), {
      body,
    });
    return {
      count: body.length,
      guildId: options.guildId,
      global: false,
      ...(diffResult !== undefined ? { diff: diffResult } : {}),
    };
  }

  await rest.put(Routes.applicationCommands(options.clientId), { body });
  return {
    count: body.length,
    global: true,
    ...(diffResult !== undefined ? { diff: diffResult } : {}),
  };
}

/** @deprecated Use {@link deployCommands} */
export const deployDirectives = deployCommands;

/** @deprecated Use {@link DeployCommandsOptions} */
export type DeployDirectivesOptions = DeployCommandsOptions;

/** @deprecated Use {@link DeployCommandsResult} */
export type DeployDirectivesResult = DeployCommandsResult;
