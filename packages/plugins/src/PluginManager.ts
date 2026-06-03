import type { PluginHookName, PluginLifecycle, StambhaClient } from "@stambha/core";
import { ContainerToken, LoggerToken } from "./tokens.js";
import type { StambhaContainer } from "./StambhaContainer.js";
import type { StambhaPlugin } from "./types.js";

export interface PluginManagerOptions {
  client: StambhaClient;
  container: StambhaContainer;
  plugins: StambhaPlugin[];
}

/** Runs plugin hooks in registration order. */
export class PluginManager implements PluginLifecycle {
  readonly client: StambhaClient;
  readonly container: StambhaContainer;
  readonly plugins: readonly StambhaPlugin[];

  constructor(options: PluginManagerOptions) {
    this.client = options.client;
    this.container = options.container;
    this.plugins = Object.freeze([...options.plugins]);
  }

  async runHook(name: PluginHookName): Promise<void> {
    const ctx = { client: this.client, container: this.container };
    for (const plugin of this.plugins) {
      const hook = plugin.hooks?.[name];
      if (hook) await hook(ctx);
    }
  }
}

export interface CreatePluginManagerOptions extends PluginManagerOptions {}

/** Attach a manager to the client for {@link StambhaClient.start} lifecycle hooks. */
export function createPluginManager(options: CreatePluginManagerOptions): PluginManager {
  const manager = new PluginManager(options);
  options.client.pluginLifecycle = manager;
  registerContainerServices(options.client, options.container);
  return manager;
}

function registerContainerServices(client: StambhaClient, container: StambhaContainer): void {
  if (client.binder.tryResolve(ContainerToken) === undefined) {
    client.binder.registerSingleton(ContainerToken, container);
  }
  if (client.binder.tryResolve(LoggerToken) === undefined) {
    client.binder.registerSingleton(LoggerToken, container.logger);
  }
}
