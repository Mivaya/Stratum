import { isSequenceCustomId, Signal, type StratumClient } from "@stratum/core";
import { handleSequenceInteraction } from "./sequence/handleSequenceInteraction.js";
import type { Message } from "discord.js";
import { DiscordJsBridge } from "./DiscordJsBridge.js";
import { commandContextFromMessage, commandContextFromSlash, scoutContextFromMessage } from "./context.js";
import {
  commandContextFromMessageViaRest,
  commandContextFromSlashViaRest,
} from "./tier/splitContext.js";
import { signalContextFromInteraction } from "./signalContext.js";

export interface AttachStratumOptions {
  prefixCommands?: boolean;
  slashCommands?: boolean;
  scouts?: boolean;
  signals?: boolean;
}

export function attachStratum(
  bridge: DiscordJsBridge,
  client: StratumClient,
  options: AttachStratumOptions = {},
): void {
  const { prefixCommands = true, slashCommands = true, scouts = true, signals = true } = options;

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

      const ctx =
        client.restPort && client.workerRole === "gateway"
          ? commandContextFromMessageViaRest(message, parsed.name, client.restPort)
          : commandContextFromMessage(message, parsed.name);
      await client.router.processPrefixCommand(ctx);
    });
  }

  bridge.client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand() && slashCommands) {
      const ctx =
        client.restPort && client.workerRole === "gateway"
          ? commandContextFromSlashViaRest(interaction, client.restPort)
          : commandContextFromSlash(interaction);
      await client.router.processSlashCommand(ctx);
      return;
    }

    const customId =
      interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()
        ? interaction.customId
        : null;

    if (!customId) return;

    if (isSequenceCustomId(customId)) {
      await handleSequenceInteraction(interaction, client.sequences);
      return;
    }

    if (!signals) return;

    const parsed = Signal.parseCustomId(customId);
    if (!parsed) return;

    const type = interaction.isButton()
      ? "button"
      : interaction.isStringSelectMenu()
        ? "select"
        : interaction.isModalSubmit()
          ? "modal"
          : null;

    if (!type) return;

    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) {
      return;
    }

    const ctx = signalContextFromInteraction(interaction, parsed.name);
    await client.signalRouter.dispatch(ctx, type);
  });
}
