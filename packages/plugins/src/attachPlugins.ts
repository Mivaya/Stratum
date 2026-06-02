import type { StratumClient } from "@stratum/core";
import { createPluginManager, type PluginManager } from "./PluginManager.js";
import { StratumContainer } from "./StratumContainer.js";
import type { StratumPlugin } from "./types.js";

export interface AttachPluginsOptions {
  plugins: StratumPlugin[];
  /** Uses {@link StratumClient.container} when it is a {@link StratumContainer}, else creates one. */
  container?: StratumContainer;
}

/**
 * Wire plugins to a client: `preInit` → register services → `postInit`.
 * Call before {@link loadPieces}; `postLoad` runs when loading finishes.
 * `preStart` / `postStart` run around {@link StratumClient.start}.
 */
export async function attachPlugins(
  client: StratumClient,
  options: AttachPluginsOptions,
): Promise<PluginManager> {
  const container =
    options.container ??
    (client.container instanceof StratumContainer ? client.container : new StratumContainer());

  const manager = createPluginManager({ client, container, plugins: options.plugins });
  await manager.runHook("preInit");
  await manager.runHook("postInit");
  return manager;
}
