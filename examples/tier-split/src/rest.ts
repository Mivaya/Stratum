import { createDiscordRestWorker } from "@stratum/bridge-discordjs";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN.");
  process.exit(1);
}

const port = Number(process.env.REST_WORKER_PORT ?? 4000);
const secret = process.env.REST_WORKER_SECRET;

const server = await createDiscordRestWorker({
  token,
  port,
  secret: secret || undefined,
});

console.log(`REST worker listening on ${server.url}`);

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});
