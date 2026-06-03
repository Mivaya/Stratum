import type { Command } from "@stambha/core";
import { buildApplicationCommands, diffApplicationCommands } from "@stambha/core";
import { createRestClient, type RestClient } from "./RestClient.js";

export interface DeployCommandsOptions {
  token: string;
  applicationId: string;
  guildId?: string;
  commands: Iterable<Command>;
  dryRun?: boolean;
  /** Log added/removed/updated command names (fetches existing when not dry-run). */
  diff?: boolean;
  /** Reuse an existing REST client (optional). */
  rest?: RestClient;
}

export interface DeployCommandsResult {
  count: number;
  guildId?: string;
  global: boolean;
  diff?: { added: string[]; removed: string[]; updated: string[] };
}

async function fetchExisting(
  rest: RestClient,
  applicationId: string,
  guildId?: string,
): Promise<{ name: string }[]> {
  const route = guildId
    ? `/applications/${applicationId}/guilds/${guildId}/commands`
    : `/applications/${applicationId}/commands`;

  try {
    return await rest.request<{ name: string }[]>({ method: "GET", route });
  } catch {
    return [];
  }
}

/** Sync slash command metadata to Discord via native REST (no bridge). */
export async function deployCommands(options: DeployCommandsOptions): Promise<DeployCommandsResult> {
  const rest =
    options.rest ??
    createRestClient({ token: options.token, applicationId: options.applicationId });

  const payload = buildApplicationCommands(options.commands);

  let diffResult: DeployCommandsResult["diff"];
  if (options.diff && !options.dryRun) {
    const existing = await fetchExisting(rest, options.applicationId, options.guildId);
    diffResult = diffApplicationCommands(existing, payload);
  } else if (options.diff && options.dryRun) {
    diffResult = diffApplicationCommands([], payload);
  }

  if (options.dryRun) {
    const result: DeployCommandsResult = {
      count: payload.length,
      global: !options.guildId,
    };
    if (options.guildId !== undefined) result.guildId = options.guildId;
    if (diffResult !== undefined) result.diff = diffResult;
    return result;
  }

  const route = options.guildId
    ? `/applications/${options.applicationId}/guilds/${options.guildId}/commands`
    : `/applications/${options.applicationId}/commands`;

  await rest.request({ method: "PUT", route, body: payload });

  return {
    count: payload.length,
    global: !options.guildId,
    ...(options.guildId !== undefined ? { guildId: options.guildId } : {}),
    ...(diffResult !== undefined ? { diff: diffResult } : {}),
  };
}
