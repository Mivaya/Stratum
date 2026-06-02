import type { PluginHookName } from "@stratum/core";
import type { StratumPlugin, PluginHookFn } from "./types.js";

/** Define a plugin from hook callbacks (no class required). */
export function definePlugin(
  name: string,
  hooks: Partial<Record<PluginHookName, PluginHookFn>>,
): StratumPlugin {
  return { name, hooks };
}
