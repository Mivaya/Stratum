import { mkdir } from "node:fs/promises";
import path from "node:path";
import { createStratumBot } from "@stratum/core";
import { createDiscordJsBridge } from "@stratum/bridge-discordjs";
import { loadPieces } from "@stratum/loader";
import {
  attachClientMetrics,
  createMetricsServer,
  createPrometheusMetrics,
} from "@stratum/metrics";
import { attachGateDeniedReply } from "@stratum/gates";
import { Vault } from "@stratum/vault";
import { SQLiteDriver } from "@stratum/vault-sql";
import { GatewayIntentBits } from "discord.js";
import { GuildBlueprint } from "./schemas/GuildBlueprint.js";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN in your environment or .env file.");
  process.exit(1);
}

const dataDir = path.resolve(process.cwd(), "data");
await mkdir(dataDir, { recursive: true });

const vault = new Vault({
  driver: new SQLiteDriver({ path: path.join(dataDir, "stratum.db") }),
  debounceMs: 400,
});
vault.registerLedger("guild", { blueprint: GuildBlueprint });

const client = createStratumBot({ prefix: process.env.PREFIX ?? "!" });

const { loaded, errors } = await loadPieces(client, {
  context: { client, vault },
});

if (errors.length > 0) {
  console.warn("Piece load warnings:", errors);
}
console.log(
  "Loaded pieces:",
  Object.entries(loaded)
    .filter(([, f]) => f.length > 0)
    .map(([k, f]) => `${k}(${f.length})`)
    .join(", "),
);

const bridge = createDiscordJsBridge(
  {
    token,
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  },
  client,
);

client.setBridge(bridge);

attachGateDeniedReply(client);

const metricsPort = process.env.METRICS_PORT ? Number(process.env.METRICS_PORT) : 0;
let detachMetrics: (() => void) | undefined;
let metricsServer: Awaited<ReturnType<typeof createMetricsServer>> | undefined;

if (metricsPort > 0) {
  const { register, collector } = createPrometheusMetrics();
  detachMetrics = attachClientMetrics(client, collector);
  metricsServer = await createMetricsServer({ port: metricsPort, register });
  console.log(`Prometheus metrics at ${metricsServer.url}/metrics`);
}

client.on("ready", async () => {
  await vault.init();
  console.log(`Stratum online as ${client.botUserId ?? "unknown"}`);
});

client.on("commandSuccess", ({ command, durationMs }) => {
  console.log(`[${command}] OK (${durationMs.toFixed(1)}ms)`);
});

process.on("SIGINT", async () => {
  detachMetrics?.();
  await metricsServer?.close();
  await vault.flush();
  await client.stop();
  process.exit(0);
});

await client.start();
