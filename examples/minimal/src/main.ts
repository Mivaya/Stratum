import { createStambhaBot, MockBridge, type CommandContext } from "@stambha/core";
import { PingCommand } from "./commands/PingCommand.js";

const bridge = new MockBridge();
const client = createStambhaBot({ bridge, prefix: "!" });

client.register(new PingCommand(client.registries.commands));

client.on("ready", () => {
  console.log("Stambha bot ready (mock bridge).");
});

client.on("commandSuccess", ({ command, durationMs }) => {
  console.log(`[${command}] OK (${durationMs.toFixed(1)}ms)`);
});

await client.start();

const ctx: CommandContext = {
  kind: "slash",
  commandName: "ping",
  userId: "user-1",
  guildId: "guild-1",
  channelId: "channel-1",
  raw: {},
  reply: async (text) => console.log(`[reply] ${text}`),
  replyEphemeral: async (text) => console.log(`[ephemeral] ${text}`),
};

await client.invoke("ping", ctx);
await client.stop();
