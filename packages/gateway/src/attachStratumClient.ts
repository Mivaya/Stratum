import type { Bridge, StratumClient } from "@stratum/core";
import {
  commandContextFromStratumMessageViaRest,
  commandContextFromStratumSlashViaRest,
  scoutContextFromStratumMessage,
  type StratumMessage,
  type StratumSlashInteraction,
} from "@stratum/transform";

export interface AttachStratumClientOptions {
  prefixCommands?: boolean;
  slashCommands?: boolean;
  scouts?: boolean;
}

function asStratumMessage(payload: unknown): StratumMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const m = payload as StratumMessage;
  if (typeof m.content !== "string" || !m.author?.id) return null;
  return m;
}

function asStratumSlash(payload: unknown): StratumSlashInteraction | null {
  if (!payload || typeof payload !== "object") return null;
  const i = payload as StratumSlashInteraction;
  if (!i.user?.id) return null;
  return i;
}

/**
 * Wire a native {@link GatewayEventHub} (or any {@link Bridge}) to Stratum routing.
 * Expects `messageCreate` / `interactionCreate` payloads as {@link StratumMessage} shapes.
 */
export function attachStratumClient(
  hub: Bridge,
  client: StratumClient,
  options: AttachStratumClientOptions = {},
): () => void {
  const { prefixCommands = true, slashCommands = true, scouts = true } = options;
  const unsubs: (() => void)[] = [];

  const on = (event: string, handler: (payload: unknown) => void | Promise<void>) => {
    hub.on(event, handler);
    unsubs.push(() => hub.off(event, handler));
  };

  on("ready", (payload) => {
    const user = (payload as { user?: { id: string } })?.user;
    if (user?.id) client.setBotUserId(user.id);
  });

  if (scouts) {
    on("messageCreate", async (payload) => {
      const message = asStratumMessage(payload);
      if (!message?.content) return;
      await client.router.processScout(scoutContextFromStratumMessage(message, "message"));
    });

    on("messageUpdate", async (payload) => {
      const message = asStratumMessage(payload);
      if (!message?.content) return;
      await client.router.processScout(scoutContextFromStratumMessage(message, "messageUpdate"));
    });
  }

  if (prefixCommands) {
    on("messageCreate", async (payload) => {
      const message = asStratumMessage(payload);
      if (!message?.content || message.author.bot) return;

      const parsed = client.router.parsePrefixCommand(message.content);
      if (!parsed) return;

      if (!client.restPort) {
        throw new Error("Native prefix commands require restPort (createNativeRestPort or HttpRestPort)");
      }

      const ctx = commandContextFromStratumMessageViaRest(
        message,
        parsed.name,
        client.restPort,
        parsed.args,
        { desired: client.desiredProperties },
      );
      await client.router.processPrefixCommand(ctx);
    });
  }

  if (slashCommands) {
    on("interactionCreate", async (payload) => {
      const interaction = asStratumSlash(payload);
      if (!interaction) return;

      const commandName = (payload as { commandName?: string }).commandName ?? "unknown";
      if (!client.restPort) {
        throw new Error("Native slash commands require restPort");
      }

      const ctx = commandContextFromStratumSlashViaRest(
        interaction,
        commandName,
        client.restPort,
        { desired: client.desiredProperties },
      );
      await client.router.processSlashCommand(ctx);
    });
  }

  return () => {
    for (const off of unsubs) off();
  };
}
