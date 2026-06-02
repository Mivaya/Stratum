/** Discord permission flags (https://discord.com/developers/docs/topics/permissions). */
export const Permission = {
  CreateInstantInvite: 1n << 0n,
  KickMembers: 1n << 1n,
  BanMembers: 1n << 2n,
  Administrator: 1n << 3n,
  ManageChannels: 1n << 4n,
  ManageGuild: 1n << 5n,
  AddReactions: 1n << 6n,
  ViewAuditLog: 1n << 7n,
  PrioritySpeaker: 1n << 8n,
  Stream: 1n << 9n,
  ViewChannel: 1n << 10n,
  SendMessages: 1n << 11n,
  SendTtsMessages: 1n << 12n,
  ManageMessages: 1n << 13n,
  EmbedLinks: 1n << 14n,
  AttachFiles: 1n << 15n,
  ReadMessageHistory: 1n << 16n,
  MentionEveryone: 1n << 17n,
  UseExternalEmojis: 1n << 18n,
  ViewGuildInsights: 1n << 19n,
  Connect: 1n << 20n,
  Speak: 1n << 21n,
  MuteMembers: 1n << 22n,
  DeafenMembers: 1n << 23n,
  MoveMembers: 1n << 24n,
  UseVad: 1n << 25n,
  ChangeNickname: 1n << 26n,
  ManageNicknames: 1n << 27n,
  ManageRoles: 1n << 28n,
  ManageWebhooks: 1n << 29n,
  ManageGuildExpressions: 1n << 30n,
  UseApplicationCommands: 1n << 31n,
  RequestToSpeak: 1n << 32n,
  ManageEvents: 1n << 33n,
  ManageThreads: 1n << 34n,
  CreatePublicThreads: 1n << 35n,
  CreatePrivateThreads: 1n << 36n,
  UseExternalStickers: 1n << 37n,
  SendMessagesInThreads: 1n << 38n,
  UseEmbeddedActivities: 1n << 39n,
  ModerateMembers: 1n << 40n,
  ViewCreatorMonetizationAnalytics: 1n << 41n,
  UseSoundboard: 1n << 42n,
  CreateGuildExpressions: 1n << 43n,
  CreateEvents: 1n << 44n,
  UseExternalSounds: 1n << 45n,
  SendVoiceMessages: 1n << 46n,
} as const;

export type PermissionFlag = (typeof Permission)[keyof typeof Permission];

/** Bitwise OR of permission flags. */
export function combinePermissions(...flags: PermissionFlag[]): bigint {
  let result = 0n;
  for (const flag of flags) {
    result |= flag;
  }
  return result;
}

/** True when `have` includes every bit in `need`. Administrator satisfies any check. */
export function hasPermissions(have: bigint | undefined, need: bigint): boolean {
  if (need === 0n) return true;
  if (have === undefined) return false;
  if ((have & Permission.Administrator) === Permission.Administrator) return true;
  return (have & need) === need;
}

/** Format missing permission names for user-facing messages (best effort). */
export function formatMissingPermissions(have: bigint | undefined, need: bigint): string {
  const missing: string[] = [];
  for (const [name, flag] of Object.entries(Permission)) {
    if ((need & flag) !== flag) continue;
    if (!hasPermissions(have, flag)) missing.push(name);
  }
  return missing.length > 0 ? missing.join(", ") : "required permissions";
}
