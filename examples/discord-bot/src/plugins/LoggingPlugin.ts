import type { PluginContext } from "@stratum/plugins";
import { definePlugin } from "@stratum/plugins";

/** Logs lifecycle milestones via the shared container logger. */
export const LoggingPlugin = definePlugin("logging", {
  postInit({ container }: PluginContext) {
    container.logger.info("Plugins initialized");
  },
  postLoad({ client, container }: PluginContext) {
    const count = client.registries.commands.size;
    container.logger.info(`Loaded ${count} command(s)`);
  },
  postStart({ container }: PluginContext) {
    container.logger.info("Bot online");
  },
});
