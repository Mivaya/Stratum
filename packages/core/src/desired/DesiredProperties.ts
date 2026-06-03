/** Which optional {@link CommandContext} fields bridges may attach. */
export interface DesiredContextFields {
  /** Gate metadata (`CommandContext.meta`). Default `true`. */
  meta?: boolean;
  /** Prefix argument string. Default `true`. */
  argsText?: boolean;
  /** Slash option values. Default `true`. */
  slashOptions?: boolean;
  /** Slash command path (root / group / sub). Default `true`. */
  slashPath?: boolean;
  /** Original transport object on `raw`. Default `true`. */
  raw?: boolean;
}

/** Which {@link CommandContextMeta} fields to populate. */
export interface DesiredMetaFields {
  channelType?: boolean;
  channelNsfw?: boolean;
  memberPermissions?: boolean;
  clientPermissions?: boolean;
}

/** Client-level mask for context slimming (Discordeno-inspired). */
export interface DesiredProperties {
  context?: DesiredContextFields;
  meta?: DesiredMetaFields;
}

export interface ResolvedDesiredProperties {
  readonly context: Required<DesiredContextFields>;
  readonly meta: Required<DesiredMetaFields>;
}

const DEFAULT_CONTEXT: Required<DesiredContextFields> = {
  meta: true,
  argsText: true,
  slashOptions: true,
  slashPath: true,
  raw: true,
};

const DEFAULT_META: Required<DesiredMetaFields> = {
  channelType: true,
  channelNsfw: true,
  memberPermissions: true,
  clientPermissions: true,
};

/** Full context — default for discord.js bots and local development. */
export const defaultDesiredProperties: ResolvedDesiredProperties = Object.freeze({
  context: DEFAULT_CONTEXT,
  meta: DEFAULT_META,
});

/** Drop `raw` and gate metadata — lower RAM, commands still run. */
export const minimalDesiredProperties: DesiredProperties = Object.freeze({
  context: { meta: false, argsText: true, slashOptions: true, slashPath: true, raw: false },
  meta: { channelType: false, channelNsfw: false, memberPermissions: false, clientPermissions: false },
});

/** Only fields required by `@stambha/gates`. */
export const gatesDesiredProperties: DesiredProperties = Object.freeze({
  context: { meta: true, argsText: true, slashOptions: true, slashPath: true, raw: false },
  meta: { channelType: true, channelNsfw: true, memberPermissions: true, clientPermissions: true },
});

export function resolveDesiredProperties(
  overrides?: DesiredProperties,
): ResolvedDesiredProperties {
  return Object.freeze({
    context: { ...DEFAULT_CONTEXT, ...overrides?.context },
    meta: { ...DEFAULT_META, ...overrides?.meta },
  });
}
