import { commandContextFromMessageViaRest } from "@stratum/bridge-discordjs";
import { createStratumBot, HttpRestPort } from "@stratum/core";
import { createWorkerServer, WorkerMessageTypes } from "@stratum/gateway";
import { loadPieces } from "@stratum/loader";
import type { Message } from "discord.js";
import { PingCommand } from "./commands/PingCommand.js";

const token = process.env.DISCORD_TOKEN;
const restUrl = process.env.REST_WORKER_URL ?? "http://127.0.0.1:4000";
const port = Number(process.env.BOT_WORKER_PORT ?? 5000);

if (!token) {
  console.error("Set DISCORD_TOKEN. Start REST worker: pnpm rest");
  process.exit(1);
}

const restPort = new HttpRestPort({
  baseUrl: restUrl,
  secret: process.env.REST_WORKER_SECRET,
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

const server = await createWorkerServer({
  port,
  secret: process.env.WORKER_SECRET,
  onMessage: async (message) => {
    if (message.type === WorkerMessageTypes.gatewayReady) {
      const payload = message.payload as { user?: { id: string } };
      if (payload.user?.id) client.setBotUserId(payload.user.id);
      console.log("Bot worker ready (via gateway relay)");
      return;
    }

    if (message.type !== WorkerMessageTypes.gatewayEvent) return;

    const { event, payload } = message.payload as { event: string; payload: unknown };
    if (event !== "messageCreate") return;

    const msg = payload as Message;
    if (!msg.content || msg.author?.bot) return;

    const parsed = client.router.parsePrefixCommand(msg.content);
    if (!parsed) return;

    const ctx = commandContextFromMessageViaRest(msg, parsed.name, restPort, parsed.args, {
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
