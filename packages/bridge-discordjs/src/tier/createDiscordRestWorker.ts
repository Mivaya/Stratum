import { createRestWorkerServer, type RestWorkerServerHandle } from "@stratum/core";
import { createDiscordRest, DiscordRestPort } from "./DiscordRestPort.js";

export interface DiscordRestWorkerOptions {
  token: string;
  port: number;
  host?: string;
  secret?: string;
}

/** Standalone REST worker process (Discord API only, no gateway). */
export async function createDiscordRestWorker(
  options: DiscordRestWorkerOptions,
): Promise<RestWorkerServerHandle> {
  const rest = createDiscordRest(options.token);
  const portImpl = new DiscordRestPort(rest);

  return createRestWorkerServer({
    port: options.port,
    portImpl,
    ...(options.host ? { host: options.host } : {}),
    ...(options.secret ? { secret: options.secret } : {}),
  });
}
