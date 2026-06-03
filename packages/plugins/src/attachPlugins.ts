import type { StambhaClient } from "@stambha/core";
import { createPluginManager, type PluginManager } from "./PluginManager.js";
import { StambhaContainer } from "./StambhaContainer.js";
import type { StambhaPlugin } from "./types.js";

export interface AttachPluginsOptions {
  plugins: StambhaPlugin[];
  /** Uses {@link StambhaClient.container} when it is a {@link StambhaContainer}, else creates one. */
  container?: StambhaContainer;
}

/**
 * Wire plugins to a client: `preInit` → register services → `postInit`.
 * Call before {@link loadPieces}; `postLoad` runs when loading finishes.
 * `preStart` / `postStart` run around {@link StambhaClient.start}.
 */
export async function attachPlugins(
  client: StambhaClient,
  options: AttachPluginsOptions,
): Promise<PluginManager> {
  const container =
    options.container ??
    (client.container instanceof StambhaContainer ? client.container : new StambhaContainer());

  const manager = createPluginManager({ client, container, plugins: options.plugins });
  await manager.runHook("preInit");
  await manager.runHook("postInit");
  return manager;
}
