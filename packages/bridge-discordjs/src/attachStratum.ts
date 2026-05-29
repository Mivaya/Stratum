import type { StratumClient } from "@stratum/core";
import type { Message } from "discord.js";
import { DiscordJsBridge } from "./DiscordJsBridge.js";
import { commandContextFromMessage, commandContextFromSlash, scoutContextFromMessage } from "./context.js";

export interface AttachStratumOptions {
  prefixCommands?: boolean;
  slashCommands?: boolean;
  scouts?: boolean;
}

export function attachStratum(
  bridge: DiscordJsBridge,
  client: StratumClient,
  options: AttachStratumOptions = {},
): void {
  const { prefixCommands = true, slashCommands = true, scouts = true } = options;

  bridge.on("ready", (payload) => {
    const user = (payload as { user?: { id: string } })?.user;
    if (user?.id) client.setBotUserId(user.id);
  });

  if (scouts) {
    bridge.client.on("messageCreate", async (message: Message) => {
      if (!message.content) return;
      const ctx = scoutContextFromMessage(message, "message");
      await client.router.processScout(ctx);
    });

    bridge.client.on("messageUpdate", async (_old, message) => {
      if (!message.content) return;
      const ctx = scoutContextFromMessage(message, "messageUpdate");
      await client.router.processScout(ctx);
    });
  }

  if (prefixCommands) {
    bridge.client.on("messageCreate", async (message: Message) => {
      if (!message.content || message.author.bot) return;

      const parsed = client.router.parsePrefixCommand(message.content);
      if (!parsed) return;

      const ctx = commandContextFromMessage(message, parsed.name);
      await client.router.processPrefixCommand(ctx);
    });
  }

  if (slashCommands) {
    bridge.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const ctx = commandContextFromSlash(interaction);
      await client.router.processSlashCommand(ctx);
    });
  }
}
