import { createBot } from "@discordeno/bot";
import { defaultDiscordenoDesiredProperties } from "@stratum/transform";
import type { DiscordenoBridgeOptions } from "./types.js";

export function createStratumDiscordenoBot(options: DiscordenoBridgeOptions) {
  return createBot({
    token: options.token,
    intents: options.intents,
    ...(options.applicationId ? { applicationId: options.applicationId } : {}),
    desiredProperties: options.desiredProperties ?? defaultDiscordenoDesiredProperties,
    ...(options.rest ? { rest: options.rest } : {}),
    ...(options.gateway ? { gateway: options.gateway } : {}),
  });
}

export type StratumBot = ReturnType<typeof createStratumDiscordenoBot>;
