/**
 * Single-process tier split v2 demo — InMemoryWorkerBus keeps live discord.js payloads.
 * Run: pnpm demo (requires DISCORD_TOKEN; optional native REST on :4000).
 */
import { commandContextFromMessageViaRest } from "@stratum/bridge-discordjs";
import { DiscordJsBridge } from "@stratum/bridge-discordjs";
import { createStratumBot, HttpRestPort } from "@stratum/core";
import { attachGatewayRelay, InMemoryWorkerBus, WorkerMessageTypes } from "@stratum/gateway";
import { loadPieces } from "@stratum/loader";
import { createNativeRestWorker } from "@stratum/rest";
import { GatewayIntentBits, type Message } from "discord.js";
import { PingCommand } from "./commands/PingCommand.js";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN");
  process.exit(1);
}

const restPort = new HttpRestPort({
  baseUrl: process.env.REST_WORKER_URL ?? "http://127.0.0.1:4000",
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

const bus = new InMemoryWorkerBus();

bus.subscribe(WorkerMessageTypes.gatewayReady, (message) => {
  const payload = message.payload as { user?: { id: string } };
  if (payload.user?.id) client.setBotUserId(payload.user.id);
});

bus.subscribe(WorkerMessageTypes.gatewayEvent, async (message) => {
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
});

const bridge = new DiscordJsBridge({
  token,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

attachGatewayRelay(bridge, { bus });

if (!process.env.REST_WORKER_URL) {
  const rest = await createNativeRestWorker({ token, port: 4000 });
  console.log(`In-process REST worker at ${rest.url}`);
  process.on("SIGINT", async () => {
    await rest.close();
  });
}

process.on("SIGINT", async () => {
  await bridge.disconnect();
  process.exit(0);
});

await bridge.connect();
console.log("Tier split v2 in-memory demo online — try !ping");
