import { createRestWorkerServer } from "@stratum/core";
import { createNativeRestPort } from "@stratum/rest";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN.");
  process.exit(1);
}

const port = Number(process.env.REST_WORKER_PORT ?? 4000);
const secret = process.env.REST_WORKER_SECRET;

const portImpl = createNativeRestPort(token);

const server = await createRestWorkerServer({
  port,
  portImpl,
  secret: secret || undefined,
});

console.log(`Native REST worker listening on ${server.url}`);

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});
