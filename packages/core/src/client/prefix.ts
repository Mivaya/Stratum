/** Context passed to {@link PrefixResolver} for per-guild or dynamic prefixes. */
export interface PrefixResolveContext {
  guildId?: string;
  channelId?: string;
  userId: string;
  content: string;
}

export type PrefixResolver = (ctx: PrefixResolveContext) => string | Promise<string>;
