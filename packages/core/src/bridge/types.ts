/** Runtime deployment mode for Stratum. */
export type { Tier, WorkerRole } from "../tier/types.js";

/**
 * Transport-agnostic facade over discord.js, Discordeno, or other libraries.
 * Implemented by `@stratum/bridge-discordjs` and `@stratum/bridge-discordeno`.
 */
export interface Bridge {
  readonly id: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  on(event: string, handler: BridgeEventHandler): void;
  once(event: string, handler: BridgeEventHandler): void;
  off(event: string, handler: BridgeEventHandler): void;
  emit(event: string, payload: unknown): void;
}

export type BridgeEventHandler = (payload: unknown) => void;

export interface BridgeOptions {
  token?: string;
}
