import type { Bridge, PrefixResolver, StambhaClient } from "@stambha/core";
import {
  commandContextFromStambhaMessageViaRest,
  commandContextFromStambhaSlashViaRest,
  scoutContextFromStambhaMessage,
  type StambhaMessage,
  type StambhaSlashInteraction,
} from "@stambha/transform";

export interface AttachStambhaClientOptions {
  prefixCommands?: boolean;
  slashCommands?: boolean;
  scouts?: boolean;
  /**
   * Per-guild or dynamic prefix. Sets {@link StambhaClient.resolvePrefix} for the lifetime of the attach.
   * When omitted, uses {@link StambhaClient.prefix}.
   */
  resolvePrefix?: PrefixResolver;
}

function asStambhaMessage(payload: unknown): StambhaMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const m = payload as StambhaMessage;
  if (typeof m.content !== "string" || !m.author?.id) return null;
  return m;
}

function asStambhaSlash(payload: unknown): StambhaSlashInteraction | null {
  if (!payload || typeof payload !== "object") return null;
  const i = payload as StambhaSlashInteraction;
  if (!i.user?.id) return null;
  return i;
}

/**
 * Wire a native {@link GatewayEventHub} (or any {@link Bridge}) to Stambha routing.
 * Expects `messageCreate` / `interactionCreate` payloads as {@link StambhaMessage} shapes.
 */
export function attachStambhaClient(
  hub: Bridge,
  client: StambhaClient,
  options: AttachStambhaClientOptions = {},
): () => void {
  const { prefixCommands = true, slashCommands = true, scouts = true, resolvePrefix } = options;
  const previousResolvePrefix = client.resolvePrefix;
  if (resolvePrefix) {
    client.resolvePrefix = resolvePrefix;
  }
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
      const message = asStambhaMessage(payload);
      if (!message?.content) return;
      await client.router.processScout(scoutContextFromStambhaMessage(message, "message"));
    });

    on("messageUpdate", async (payload) => {
      const message = asStambhaMessage(payload);
      if (!message?.content) return;
      await client.router.processScout(scoutContextFromStambhaMessage(message, "messageUpdate"));
    });
  }

  if (prefixCommands) {
    on("messageCreate", async (payload) => {
      const message = asStambhaMessage(payload);
      if (!message?.content || message.author.bot) return;

      const prefixCtx = { userId: message.author.id };
      if (message.guildId) Object.assign(prefixCtx, { guildId: message.guildId });
      if (message.channelId) Object.assign(prefixCtx, { channelId: message.channelId });
      const parsed = await client.router.parsePrefixCommand(message.content, prefixCtx);
      if (!parsed) return;

      if (!client.restPort) {
        throw new Error("Native prefix commands require restPort (createNativeRestPort or HttpRestPort)");
      }

      const ctx = commandContextFromStambhaMessageViaRest(
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
      const interaction = asStambhaSlash(payload);
      if (!interaction) return;

      const commandName = (payload as { commandName?: string }).commandName ?? "unknown";
      if (!client.restPort) {
        throw new Error("Native slash commands require restPort");
      }

      const ctx = commandContextFromStambhaSlashViaRest(
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
    if (resolvePrefix) {
      client.resolvePrefix = previousResolvePrefix;
    }
  };
}
