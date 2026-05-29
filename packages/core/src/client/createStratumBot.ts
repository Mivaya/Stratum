import { StratumClient } from "./StratumClient.js";
import type { CreateStratumBotOptions } from "./types.js";

/**
 * Programmatic entry point — no CLI required.
 *
 * @example
 * ```ts
 * const client = createStratumBot({ bridge: myBridge, prefix: "!" });
 * client.register(new PingCommand(client.registries.commands));
 * await client.start();
 * ```
 */
export function createStratumBot(options: CreateStratumBotOptions = {}): StratumClient {
  const { autostart = false, ...clientOptions } = options;
  const client = new StratumClient(clientOptions);

  if (autostart && client.bridge) {
    void client.start().catch((error: unknown) => {
      console.error("[stratum] Autostart failed:", error);
    });
  }

  return client;
}
