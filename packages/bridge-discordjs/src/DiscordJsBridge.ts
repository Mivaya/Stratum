import type { Bridge, BridgeEventHandler } from "@stratum/core";
import {
  Client,
  type ClientOptions,
  type GatewayIntentBits,
  type Partials,
} from "discord.js";

export interface DiscordJsBridgeOptions {
  token: string;
  intents: GatewayIntentBits[];
  partials?: Partials[];
  clientOptions?: Omit<ClientOptions, "intents">;
}

/**
 * discord.js implementation of the Stratum {@link Bridge} interface.
 */
export class DiscordJsBridge implements Bridge {
  readonly id = "discordjs";

  readonly client: Client;
  private readonly handlers = new Map<string, Set<BridgeEventHandler>>();
  private readonly token: string;

  constructor(options: DiscordJsBridgeOptions) {
    this.token = options.token;
    const clientOptions: ClientOptions = {
      intents: options.intents,
      ...options.clientOptions,
    };
    if (options.partials !== undefined) {
      clientOptions.partials = options.partials;
    }
    this.client = new Client(clientOptions);

    this.forwardClientEvents();
  }

  private forwardClientEvents(): void {
    const forward = (event: string) => {
      this.client.on(event, (...args: unknown[]) => {
        const payload = args.length === 1 ? args[0] : args;
        this.emit(event, payload);
      });
    };

    forward("ready");
    forward("messageCreate");
    forward("messageUpdate");
    forward("interactionCreate");
    forward("guildCreate");
    forward("guildDelete");
  }

  async connect(): Promise<void> {
    await this.client.login(this.token);
    this.emit("ready", { user: this.client.user });
  }

  async disconnect(): Promise<void> {
    this.client.destroy();
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
