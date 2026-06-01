import type { PluginHookName, StratumClient } from "@stratum/core";
import type { StratumContainer } from "./StratumContainer.js";

export interface PluginContext {
  client: StratumClient;
  container: StratumContainer;
}

export type PluginHookFn = (ctx: PluginContext) => void | Promise<void>;

export interface StratumPlugin {
  name: string;
  hooks?: Partial<Record<PluginHookName, PluginHookFn>>;
}
