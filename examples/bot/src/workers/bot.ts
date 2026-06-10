import { HttpRestPort } from "@stambha/core";
import { createWorkerServer, WorkerMessageTypes } from "@stambha/gateway";
import { commandContextFromStambhaMessageViaRest } from "@stambha/transform";
import type { StambhaMessage } from "@stambha/transform";
import { setupBot } from "../lib/setup.js";

const token = process.env.DISCORD_TOKEN;
const restUrl = process.env.REST_WORKER_URL ?? "http://127.0.0.1:4000";
const port = Number(process.env.BOT_WORKER_PORT ?? 5000);

if (!token) {
  console.error("Set DISCORD_TOKEN. Start REST worker: pnpm split:rest");
  process.exit(1);
}

const restPort = new HttpRestPort({
  baseUrl: restUrl,
  ...(process.env.REST_WORKER_SECRET ? { secret: process.env.REST_WORKER_SECRET } : {}),
});

const { client } = await setupBot({
  tier: "split",
  workerRole: "gateway",
  restPort,
});

const server = await createWorkerServer({
  port,
  ...(process.env.WORKER_SECRET ? { secret: process.env.WORKER_SECRET } : {}),
  onMessage: async (message) => {
    if (message.type === WorkerMessageTypes.gatewayReady) {
      const payload = message.payload as { user?: { id: string } };
      if (payload.user?.id) client.setBotUserId(payload.user.id);
      console.log("[split:bot] ready via gateway relay");
      return;
    }

    if (message.type !== WorkerMessageTypes.gatewayEvent) return;

    const { event, payload } = message.payload as { event: string; payload: unknown };
    if (event !== "messageCreate") return;

    const msg = payload as StambhaMessage;
    if (!msg.content || msg.author?.bot) return;

    const parsed = await client.router.parsePrefixCommand(msg.content, {
      guildId: msg.guildId,
      channelId: msg.channelId,
      userId: msg.author.id,
    });
    if (!parsed) return;

    const ctx = commandContextFromStambhaMessageViaRest(msg, parsed.name, restPort, parsed.args, {
      desired: client.desiredProperties,
    });
    await client.router.processPrefixCommand(ctx);
  },
});

console.log(`Bot worker at ${server.url} (REST via ${restUrl})`);

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});
