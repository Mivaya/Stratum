import { createStratumBot } from "@stratum/core";
import { createDiscordJsBridge } from "@stratum/bridge-discordjs";
import { MemoryDriver, Vault } from "@stratum/vault";
import { GatewayIntentBits } from "discord.js";
import { PingCommand } from "./commands/General/PingCommand.js";
import { PrefixCommand } from "./commands/General/PrefixCommand.js";
import { ReadyListener } from "./listeners/ReadyListener.js";
import { GuildBlueprint } from "./schemas/GuildBlueprint.js";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN in your environment or .env file.");
  process.exit(1);
}

const vault = new Vault({ driver: new MemoryDriver(), debounceMs: 400 });
vault.registerLedger("guild", { blueprint: GuildBlueprint });

const client = createStratumBot({ prefix: process.env.PREFIX ?? "!" });

client.register(new PingCommand(client.registries.commands));
client.register(new PrefixCommand(client.registries.commands, vault));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));

const bridge = createDiscordJsBridge(
  {
    token,
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  },
  client,
);

client.setBridge(bridge);

client.on("ready", async () => {
  await vault.init();
  console.log(`Stratum online as ${client.botUserId ?? "unknown"}`);
});

client.on("commandSuccess", ({ command, durationMs }) => {
  console.log(`[${command}] OK (${durationMs.toFixed(1)}ms)`);
});

process.on("SIGINT", async () => {
  await vault.flush();
  await client.stop();
  process.exit(0);
});

await client.start();
