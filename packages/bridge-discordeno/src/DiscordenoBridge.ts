import type { Bridge, BridgeEventHandler } from "@stratum/core";
import { createStratumDiscordenoBot, type StratumBot } from "./createStratumDiscordenoBot.js";
import type { DiscordenoBridgeOptions } from "./types.js";

/**
 * Discordeno implementation of the Stratum {@link Bridge} interface.
 */
export class DiscordenoBridge implements Bridge {
  readonly id = "discordeno";

  readonly bot: StratumBot;

  private readonly handlers = new Map<string, Set<BridgeEventHandler>>();
  private started = false;

  constructor(options: DiscordenoBridgeOptions) {
    this.bot = createStratumDiscordenoBot(options);
    this.installBridgeEvents();
  }

  private installBridgeEvents(): void {
    const bridge = this;
    const events = this.bot.events;

    events.ready = (_payload, _raw) => {
      bridge.emit("ready", {
        user: { id: String(bridge.bot.id) },
      });
    };

    events.messageCreate = (message) => {
      bridge.emit("messageCreate", message);
    };

    events.messageUpdate = (message) => {
      bridge.emit("messageUpdate", message);
    };

    events.interactionCreate = (interaction) => {
      bridge.emit("interactionCreate", interaction);
    };

    events.guildCreate = (guild) => {
      bridge.emit("guildCreate", guild);
    };

    events.guildDelete = (id, shardId) => {
      bridge.emit("guildDelete", { id, shardId });
    };
  }

  async connect(): Promise<void> {
    if (this.started) return;
    await this.bot.start();
    this.started = true;
  }

  async disconnect(): Promise<void> {
    if (!this.started) return;
    await this.bot.shutdown();
    this.started = false;
  }

  on(event: string, handler: BridgeEventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  once(event: string, handler: BridgeEventHandler): void {
    const wrapper: BridgeEventHandler = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    this.on(event, wrapper);
  }

  off(event: string, handler: BridgeEventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, payload: unknown): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      handler(payload);
    }
  }
}
