import type { StratumClient } from "@stratum/core";
import { DiscordJsBridge, type DiscordJsBridgeOptions } from "./DiscordJsBridge.js";
import { attachStratum, type AttachStratumOptions } from "./attachStratum.js";

export interface CreateDiscordJsBridgeOptions extends DiscordJsBridgeOptions {
  attach?: AttachStratumOptions | false;
}

/**
 * Factory: create bridge and optionally attach to a Stratum client.
 */
export function createDiscordJsBridge(
  options: CreateDiscordJsBridgeOptions,
  client?: StratumClient,
): DiscordJsBridge {
  const { attach: attachOptions = {}, ...bridgeOptions } = options;
  const bridge = new DiscordJsBridge(bridgeOptions);

  if (client && attachOptions !== false) {
    attachStratum(bridge, client, attachOptions ?? {});
  }

  return bridge;
}
