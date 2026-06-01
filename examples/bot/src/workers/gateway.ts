import { attachGatewayRelay, createGatewayEventHub, createHttpWorkerClient } from "@stratum/gateway";

const botWorkerUrl = process.env.BOT_WORKER_URL ?? "http://127.0.0.1:5000";

const bus = createHttpWorkerClient({
  baseUrl: botWorkerUrl,
  ...(process.env.WORKER_SECRET ? { secret: process.env.WORKER_SECRET } : {}),
});

const hub = createGatewayEventHub();
attachGatewayRelay(hub, { bus });

hub.markReady({ user: { id: process.env.BOT_USER_ID ?? "0" } });
await hub.connect();

console.log(`Gateway relay online → ${botWorkerUrl}`);
console.log("Feed shard events: hub.emit('messageCreate', { ... })");

process.on("SIGINT", async () => {
  await hub.disconnect();
  process.exit(0);
});
