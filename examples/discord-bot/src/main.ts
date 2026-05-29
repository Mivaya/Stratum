import { createStratumBot } from "@stratum/core";
import { createDiscordJsBridge } from "@stratum/bridge-discordjs";
import { GatewayIntentBits } from "discord.js";
import { PingCommand } from "./commands/General/PingCommand.js";
import { ReadyListener } from "./listeners/ReadyListener.js";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN in your environment or .env file.");
  process.exit(1);
}

const client = createStratumBot({ prefix: process.env.PREFIX ?? "!" });

client.register(new PingCommand(client.registries.commands));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));

const bridge = createDiscordJsBridge(
  {
    token,
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  },
  client,
);

client.setBridge(bridge);

client.on("ready", () => {
  console.log(`Stratum online as ${client.botUserId ?? "unknown"}`);
});

client.on("commandSuccess", ({ command, durationMs }) => {
  console.log(`[${command}] OK (${durationMs.toFixed(1)}ms)`);
});

await client.start();
