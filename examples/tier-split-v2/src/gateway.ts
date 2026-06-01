import { DiscordJsBridge } from "@stratum/bridge-discordjs";
import { attachGatewayRelay, createHttpWorkerClient } from "@stratum/gateway";
import { GatewayIntentBits } from "discord.js";

const token = process.env.DISCORD_TOKEN;
const botWorkerUrl = process.env.BOT_WORKER_URL ?? "http://127.0.0.1:5000";

if (!token) {
  console.error("Set DISCORD_TOKEN. Start bot worker first: pnpm bot");
  process.exit(1);
}

const bus = createHttpWorkerClient({
  baseUrl: botWorkerUrl,
  secret: process.env.WORKER_SECRET,
});

const bridge = new DiscordJsBridge({
  token,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

attachGatewayRelay(bridge, { bus });

process.on("SIGINT", async () => {
  await bridge.disconnect();
  process.exit(0);
});

await bridge.connect();
console.log(`Gateway relay online → ${botWorkerUrl}`);
