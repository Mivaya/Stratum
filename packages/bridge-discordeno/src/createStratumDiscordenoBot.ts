import { createBot } from "@discordeno/bot";
import { stratumDesiredProperties } from "./desiredProperties.js";
import type { DiscordenoBridgeOptions } from "./types.js";

export function createStratumDiscordenoBot(options: DiscordenoBridgeOptions) {
  return createBot({
    token: options.token,
    intents: options.intents,
    ...(options.applicationId ? { applicationId: options.applicationId } : {}),
    desiredProperties: stratumDesiredProperties,
    ...(options.rest ? { rest: options.rest } : {}),
    ...(options.gateway ? { gateway: options.gateway } : {}),
  });
}

export type StratumBot = ReturnType<typeof createStratumDiscordenoBot>;
