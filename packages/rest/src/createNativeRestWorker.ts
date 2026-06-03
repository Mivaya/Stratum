import { createRestWorkerServer, type RestWorkerServerHandle } from "@stambha/core";
import { createRestClient, NativeRestPort, type RestClient } from "./RestClient.js";
import { RateLimitQueue } from "./RateLimitQueue.js";
import { createRestTelemetryListener, type RestTelemetry } from "./telemetry.js";

export interface NativeRestWorkerOptions {
  token: string;
  port: number;
  host?: string;
  /** Bearer token for `POST /v1/rest` (gateway → worker). */
  secret?: string;
  /** Rate-limit + request telemetry (e.g. from `@stambha/metrics`). */
  telemetry?: RestTelemetry;
  fetchImpl?: typeof fetch;
}

export interface NativeRestWorkerHandle extends RestWorkerServerHandle {
  readonly client: RestClient;
  readonly queue: RateLimitQueue;
}

/**
 * Standalone native REST worker — drop-in replacement for
 * Native REST worker — replaces legacy discord.js REST workers.
 */
export async function createNativeRestWorker(
  options: NativeRestWorkerOptions,
): Promise<NativeRestWorkerHandle> {
  const queue = new RateLimitQueue({
    ...(options.telemetry ? { listener: createRestTelemetryListener(options.telemetry) } : {}),
  });
  const client = createRestClient({
    token: options.token,
    queue,
    ...(options.telemetry ? { telemetry: options.telemetry } : {}),
    ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {}),
  });

  const server = await createRestWorkerServer({
    port: options.port,
    portImpl: new NativeRestPort(client),
    ...(options.host ? { host: options.host } : {}),
    ...(options.secret ? { secret: options.secret } : {}),
  });

  return { ...server, client, queue };
}
