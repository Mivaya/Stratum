import { StambhaClient } from "./StambhaClient.js";
import type { CreateStambhaBotOptions } from "./types.js";

/**
 * Programmatic entry point — no CLI required.
 *
 * @example
 * ```ts
 * const client = createStambhaBot({ bridge: myBridge, prefix: "!" });
 * client.register(new PingCommand(client.registries.commands));
 * await client.start();
 * ```
 */
export function createStambhaBot(options: CreateStambhaBotOptions = {}): StambhaClient {
  const { autostart = false, ...clientOptions } = options;
  const client = new StambhaClient(clientOptions);

  if (autostart && client.bridge) {
    void client.start().catch((error: unknown) => {
      console.error("[stambha] Autostart failed:", error);
    });
  }

  return client;
}
