import type { PluginHookName, StambhaClient } from "@stambha/core";
import type { StambhaContainer } from "./StambhaContainer.js";

export interface PluginContext {
  client: StambhaClient;
  container: StambhaContainer;
}

export type PluginHookFn = (ctx: PluginContext) => void | Promise<void>;

export interface StambhaPlugin {
  name: string;
  hooks?: Partial<Record<PluginHookName, PluginHookFn>>;
}
