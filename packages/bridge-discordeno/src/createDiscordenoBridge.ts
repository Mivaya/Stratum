import type { StratumClient } from "@stratum/core";
import { buildDiscordenoDesiredProperties } from "@stratum/transform";
import { DiscordenoBridge } from "./DiscordenoBridge.js";
import { attachStratum, type AttachStratumOptions } from "./attachStratum.js";
import type { DiscordenoBridgeOptions } from "./types.js";

export interface CreateDiscordenoBridgeOptions extends DiscordenoBridgeOptions {
  attach?: AttachStratumOptions | false;
}

/**
 * Factory: create Discordeno bridge and optionally attach to a Stratum client.
 */
export function createDiscordenoBridge(
  options: CreateDiscordenoBridgeOptions,
  client?: StratumClient,
): DiscordenoBridge {
  const { attach: attachOptions = {}, ...bridgeOptions } = options;

  if (client && bridgeOptions.desiredProperties === undefined) {
    bridgeOptions.desiredProperties = buildDiscordenoDesiredProperties(client.desiredProperties);
  }

  const bridge = new DiscordenoBridge(bridgeOptions);

  if (client && attachOptions !== false) {
    attachStratum(bridge, client, attachOptions ?? {});
  }

  return bridge;
}
