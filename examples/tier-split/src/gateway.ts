import { createStratumBot, HttpRestPort } from "@stratum/core";
import { createDiscordJsBridge } from "@stratum/bridge-discordjs";
import { loadPieces } from "@stratum/loader";
import { GatewayIntentBits } from "discord.js";
import { PingCommand } from "./commands/PingCommand.js";

const token = process.env.DISCORD_TOKEN;
const restUrl = process.env.REST_WORKER_URL ?? "http://127.0.0.1:4000";
const secret = process.env.REST_WORKER_SECRET;

if (!token) {
  console.error("Set DISCORD_TOKEN. Start the REST worker first: pnpm rest");
  process.exit(1);
}

const restPort = new HttpRestPort({
  baseUrl: restUrl,
  secret: secret || undefined,
});

const client = createStratumBot({
  tier: "split",
  workerRole: "gateway",
  restPort,
  prefix: "!",
});

client.register(new PingCommand(client.registries.commands));

await loadPieces(client, {
  paths: {
    commands: false,
    listeners: "src/listeners",
    scouts: false,
    barriers: false,
    gates: false,
    epilogues: false,
    conduits: false,
    signals: false,
    tasks: false,
  },
});

const bridge = createDiscordJsBridge(
  {
    token,
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  },
  client,
);

client.setBridge(bridge);

client.on("ready", () => {
  console.log(`Gateway online (REST via ${restUrl})`);
});

process.on("SIGINT", async () => {
  await client.stop();
  process.exit(0);
});

await client.start();
