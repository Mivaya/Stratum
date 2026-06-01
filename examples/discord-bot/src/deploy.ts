import { deployCommands } from "@stratum/bridge-discordjs";
import { createStratumBot } from "@stratum/core";
import { loadPieces } from "@stratum/loader";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error("Set DISCORD_TOKEN and DISCORD_CLIENT_ID.");
  process.exit(1);
}

const client = createStratumBot();

await loadPieces(client, { context: { client } });

const result = await deployCommands({
  token,
  clientId,
  guildId,
  commands: client.registries.commands.values(),
  diff: true,
});

console.log(`Deployed ${result.count} command(s) (${result.global ? "global" : `guild ${result.guildId}`}).`);
if (result.diff) {
  console.log("Diff:", result.diff);
}
