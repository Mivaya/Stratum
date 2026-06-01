/** Runtime shapes used by the bridge (Discordeno desired-properties safe). */
export interface DiscordenoMessage {
  id?: bigint;
  content?: string;
  channelId?: bigint;
  guildId?: bigint;
  author?: { id?: bigint; bot?: boolean };
}

export interface DiscordenoInteraction {
  id?: bigint;
  type?: number;
  token?: string;
  data?: Record<string, unknown> & {
    name?: string;
    customId?: string;
    componentType?: number;
    components?: Array<{ components?: Array<{ customId?: string; value?: string }> }>;
    values?: string[];
  };
  user?: { id?: bigint };
  guildId?: bigint;
  channelId?: bigint;
  acknowledged?: boolean;
  member?: { permissions?: bigint | string };
}

export interface DiscordenoBridgeOptions {
  token: string;
  intents: import("@discordeno/bot").GatewayIntents;
  applicationId?: string;
  rest?: Record<string, unknown>;
  gateway?: Record<string, unknown>;
  /** Discordeno gateway desired-properties mask (defaults to Stratum preset). */
  desiredProperties?: Record<string, unknown>;
}
