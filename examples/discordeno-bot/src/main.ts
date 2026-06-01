import { createStratumBot } from "@stratum/core";
import { createDiscordenoBridge } from "@stratum/bridge-discordeno";
import { loadPieces } from "@stratum/loader";
import { GatewayIntents } from "@discordeno/bot";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN in your environment or .env file.");
  process.exit(1);
}

const client = createStratumBot({ prefix: process.env.PREFIX ?? "!" });

const { loaded, errors } = await loadPieces(client, {
  context: { client },
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

const bridge = createDiscordenoBridge(
  {
    token,
    intents:
      GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent,
  },
  client,
);

client.setBridge(bridge);

client.on("ready", () => {
  console.log(`Stratum (Discordeno) online as ${client.botUserId ?? "unknown"}`);
});

client.on("commandSuccess", ({ command, durationMs }) => {
  console.log(`[${command}] OK (${durationMs.toFixed(1)}ms)`);
});

process.on("SIGINT", async () => {
  await client.stop();
  process.exit(0);
});

await client.start();
