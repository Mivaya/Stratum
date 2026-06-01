import { createNativeRestWorker } from "@stratum/rest";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN");
  process.exit(1);
}

const port = Number(process.env.REST_PORT ?? 4000);
const server = await createNativeRestWorker({
  token,
  port,
  secret: process.env.REST_WORKER_SECRET,
});

console.log(`REST worker at ${server.url}`);

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});
