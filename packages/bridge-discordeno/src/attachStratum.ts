import { isSequenceCustomId, Signal, type StratumClient } from "@stratum/core";
import type { DiscordenoBridge } from "./DiscordenoBridge.js";
import {
  commandContextFromMessage,
  commandContextFromSlash,
  createScoutContext,
  getInteractionCustomId,
  isApplicationCommand,
  isMessageAuthorBot,
  isMessageComponent,
  isModalSubmit,
} from "./context.js";
import { handleSequenceInteraction } from "./sequence/handleSequenceInteraction.js";
import { signalContextFromInteraction } from "./signalContext.js";
import type { DiscordenoInteraction, DiscordenoMessage } from "./types.js";

export interface AttachStratumOptions {
  prefixCommands?: boolean;
  slashCommands?: boolean;
  scouts?: boolean;
  signals?: boolean;
}

export function attachStratum(
  bridge: DiscordenoBridge,
  client: StratumClient,
  options: AttachStratumOptions = {},
): void {
  const { prefixCommands = true, slashCommands = true, scouts = true, signals = true } = options;
  const bot = bridge.bot;
  const events = bot.events;

  bridge.on("ready", (payload) => {
    const user = (payload as { user?: { id: string } })?.user;
    if (user?.id) client.setBotUserId(user.id);
  });

  const forwardMessageCreate = events.messageCreate;
  events.messageCreate = async (rawMessage) => {
    const message = rawMessage as DiscordenoMessage;
    await forwardMessageCreate?.(rawMessage);

    if (scouts && message.content) {
      await client.router.processScout(createScoutContext(bot, message, "message"));
    }

    if (prefixCommands && message.content && !isMessageAuthorBot(message)) {
      const parsed = client.router.parsePrefixCommand(message.content);
      if (parsed) {
        const ctx = commandContextFromMessage(bot, message, parsed.name);
        await client.router.processPrefixCommand(ctx);
      }
    }
  };

  const forwardMessageUpdate = events.messageUpdate;
  events.messageUpdate = async (rawMessage) => {
    const message = rawMessage as DiscordenoMessage;
    await forwardMessageUpdate?.(rawMessage);

    if (scouts && message.content) {
      await client.router.processScout(createScoutContext(bot, message, "messageUpdate"));
    }
  };

  const forwardInteraction = events.interactionCreate;
  events.interactionCreate = async (rawInteraction) => {
    const interaction = rawInteraction as DiscordenoInteraction;
    await forwardInteraction?.(rawInteraction);

    if (isApplicationCommand(interaction) && slashCommands) {
      const ctx = commandContextFromSlash(bot, interaction);
      await client.router.processSlashCommand(ctx);
      return;
    }

    const customId = getInteractionCustomId(interaction);

    if (customId && isSequenceCustomId(customId)) {
      await handleSequenceInteraction(bot, interaction, client.sequences);
      return;
    }

    if (!signals || !customId) return;

    const parsed = Signal.parseCustomId(customId);
    if (!parsed) return;

    const componentType = isMessageComponent(interaction) ? interaction.data?.componentType : null;

    const type = isMessageComponent(interaction)
      ? componentType === 3
        ? "select"
        : "button"
      : isModalSubmit(interaction)
        ? "modal"
        : null;

    if (!type) return;

    const ctx = signalContextFromInteraction(bot, interaction, parsed.name);
    await client.signalRouter.dispatch(ctx, type);
  };
}
