import { createStratumDiscordenoBot } from "@stratum/bridge-discordeno";
import { deployCommands } from "@stratum/bridge-discordeno";
import { createStratumBot } from "@stratum/core";
import { loadPieces } from "@stratum/loader";

import { GatewayIntents } from "@discordeno/bot";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN.");
  process.exit(1);
}

const client = createStratumBot({ prefix: "!" });
await loadPieces(client, { context: { client } });

const bot = createStratumDiscordenoBot({
  token,
  intents: GatewayIntents.Guilds,
});

const result = await deployCommands({
  bot,
  commands: client.registries.commands.values(),
  guildId: process.env.GUILD_ID,
  dryRun: process.argv.includes("--dry-run"),
});

console.log(`Deployed ${result.count} slash command(s) (${result.global ? "global" : `guild ${result.guildId}`})`);
