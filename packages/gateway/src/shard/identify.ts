import type { SessionInfo } from "@stambha/transport";

/** Gateway opcode 2 — Identify */
export interface GatewayIdentifyPayload {
  readonly op: 2;
  readonly d: {
    readonly token: string;
    readonly intents: number | string;
    readonly properties: {
      readonly $os: string;
      readonly $browser: string;
      readonly $device: string;
    };
    readonly shard: [number, number];
  };
}

/** Gateway opcode 6 — Resume */
export interface GatewayResumePayload {
  readonly op: 6;
  readonly d: {
    readonly token: string;
    readonly session_id: string;
    readonly seq: number;
  };
}

export interface BuildIdentifyOptions {
  session: SessionInfo;
  shardId: number;
  totalShards: number;
  intents: bigint | number;
  properties?: { os?: string; browser?: string; device?: string };
}

export function buildIdentifyPayload(options: BuildIdentifyOptions): GatewayIdentifyPayload {
  const intents =
    typeof options.intents === "bigint" ? Number(options.intents) : options.intents;
  return {
    op: 2,
    d: {
      token: options.session.token,
      intents,
      properties: {
        $os: options.properties?.os ?? "linux",
        $browser: options.properties?.browser ?? "stambha",
        $device: options.properties?.device ?? "stambha",
      },
      shard: [options.shardId, options.totalShards],
    },
  };
}

export function buildResumePayload(
  session: SessionInfo,
  sessionId: string,
  sequence: number,
): GatewayResumePayload {
  return {
    op: 6,
    d: {
      token: session.token,
      session_id: sessionId,
      seq: sequence,
    },
  };
}

/** Common gateway intents (subset; extend as needed). */
export const GatewayIntent = {
  Guilds: 1n << 0n,
  GuildMessages: 1n << 9n,
  MessageContent: 1n << 15n,
  DirectMessages: 1n << 12n,
} as const;

export function combineIntents(...flags: bigint[]): bigint {
  return flags.reduce((acc, f) => acc | f, 0n);
}
