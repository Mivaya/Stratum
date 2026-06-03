import { dirname, resolve as nodeResolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RestPort, RestRequest, StambhaClient } from "@stambha/core";
import { createStambhaBot, HttpRestPort } from "@stambha/core";
import { attachGateDeniedReply } from "@stambha/gates";
import { loadPieces } from "@stambha/loader";
import { attachPlugins } from "@stambha/plugins";
import { createNativeRestPort } from "@stambha/rest";
import { MemoryDriver, Vault } from "@stambha/vault";
import { LoggingPlugin } from "../plugins/LoggingPlugin.js";
import { GuildBlueprint } from "../schemas/GuildBlueprint.js";

export interface BotSetupOptions {
  tier?: "monolith" | "split";
  workerRole?: "monolith" | "gateway";
  restPort?: RestPort;
  prefix?: string;
  /** Use console-logging REST stub (no DISCORD_TOKEN). */
  demo?: boolean;
}

function createDemoRestPort(): RestPort {
  return {
    async request<T>(req: RestRequest) {
      const body = req.body as { content?: string } | undefined;
      if (body?.content) console.log(`[demo:reply] ${body.content}`);
      return {} as T;
    },
  };
}

export interface BotSetupResult {
  client: StambhaClient;
  vault: Vault;
}

export async function setupBot(options: BotSetupOptions = {}): Promise<BotSetupResult> {
  const token = process.env.DISCORD_TOKEN;
  const useExternalRest = Boolean(process.env.REST_WORKER_URL);

  let restPort = options.restPort;
  if (!restPort) {
    if (options.demo) {
      restPort = createDemoRestPort();
    } else if (useExternalRest) {
      restPort = new HttpRestPort({
        baseUrl: process.env.REST_WORKER_URL!,
        ...(process.env.REST_WORKER_SECRET
          ? { secret: process.env.REST_WORKER_SECRET }
          : {}),
      });
    } else if (token) {
      restPort = createNativeRestPort(token);
    }
  }

  const client = createStambhaBot({
    tier: options.tier ?? "monolith",
    workerRole: options.workerRole ?? "monolith",
    ...(restPort ? { restPort } : {}),
    prefix: options.prefix ?? "!",
  });

  const vault = new Vault({ driver: new MemoryDriver(), debounceMs: 50 });
  vault.registerLedger("guild", { blueprint: GuildBlueprint });
  await vault.init();

  const manager = await attachPlugins(client, { plugins: [LoggingPlugin] });
  client.pluginLifecycle = manager;

  attachGateDeniedReply(client);

  const projectRoot = nodeResolve(dirname(fileURLToPath(import.meta.url)), "../..");

  const loaded = await loadPieces(client, {
    basePath: projectRoot,
    context: { client, vault },
  });
  if (loaded.errors.length > 0) {
    for (const { file, error } of loaded.errors) {
      console.error(`[loader] ${file}:`, error);
    }
  }

  return { client, vault };
}
