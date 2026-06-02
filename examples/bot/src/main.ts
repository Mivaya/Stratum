import { attachStratumClient, createGatewayEventHub } from "@stratum/gateway";
import { createNativeRestWorker } from "@stratum/rest";
import type { StratumMessage } from "@stratum/transform";
import { setupBot } from "./lib/setup.js";

const demo = process.env.DEMO === "1";
const token = process.env.DISCORD_TOKEN;

if (!demo && !token) {
  console.error("Set DISCORD_TOKEN or run with DEMO=1 (pnpm demo).");
  process.exit(1);
}

const { client } = await setupBot({ demo });

const hub = createGatewayEventHub();
attachStratumClient(hub, client);
client.setBridge(hub);

let restCloser: (() => Promise<void>) | null = null;

if (!demo && token && !process.env.REST_WORKER_URL) {
  const rest = await createNativeRestWorker({ token, port: Number(process.env.REST_PORT ?? 4000) });
  console.log(`In-process REST worker at ${rest.url}`);
  restCloser = async () => {
    await rest.close();
  };
}

const botUserId = process.env.BOT_USER_ID ?? "demo-bot";
hub.markReady({ user: { id: botUserId, username: "StratumBot" } });
await client.start();

console.log("Stratum bot online (native gateway hub + REST).");
console.log("Folder layout: commands, listeners, scouts, barriers, gates, conduits, epilogues, signals, tasks, schemas.");

if (demo) {
  console.log("\n--- demo events ---\n");

  hub.emit("messageCreate", {
    id: "1",
    content: "!ping",
    channelId: "c1",
    guildId: "g1",
    author: { id: "u1", bot: false },
  } satisfies StratumMessage);

  hub.emit("messageCreate", {
    id: "2",
    content: "!echo hello from demo",
    channelId: "c1",
    guildId: "g1",
    author: { id: "u1", bot: false },
  } satisfies StratumMessage);

  hub.emit("messageCreate", {
    id: "3",
    content: `<@${botUserId}> hey`,
    channelId: "c1",
    guildId: "g1",
    author: { id: "u2", bot: false },
  } satisfies StratumMessage);

  console.log("\n--- end demo ---\n");
} else {
  console.log("Connect your WebSocket shard worker and hub.emit(...) Discord events here.");
}

process.on("SIGINT", async () => {
  await client.stop();
  if (restCloser) await restCloser();
  process.exit(0);
});
