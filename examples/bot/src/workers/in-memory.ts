import { attachStratumClient, createGatewayEventHub } from "@stratum/gateway";
import { createNativeRestWorker } from "@stratum/rest";
import type { StratumMessage } from "@stratum/transform";
import { setupBot } from "../lib/setup.js";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN");
  process.exit(1);
}

const { client } = await setupBot();

const hub = createGatewayEventHub();
attachStratumClient(hub, client);
client.setBridge(hub);

const rest = await createNativeRestWorker({ token, port: 4000 });
console.log(`In-process REST at ${rest.url}`);

hub.markReady({ user: { id: "split-demo" } });
await client.start();

console.log("Split demo — simulated !ping");

hub.emit("messageCreate", {
  id: "1",
  content: "!ping",
  channelId: "c1",
  guildId: "g1",
  author: { id: "u1", bot: false },
} satisfies StratumMessage);

process.on("SIGINT", async () => {
  await client.stop();
  await rest.close();
  process.exit(0);
});
