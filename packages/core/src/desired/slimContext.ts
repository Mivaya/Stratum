import type { CommandContextMeta } from "../context/meta.js";
import type { CommandContext } from "../context/types.js";
import type { DesiredMetaFields, ResolvedDesiredProperties } from "./DesiredProperties.js";

/** Trim gate metadata to requested fields. */
export function slimMeta(
  meta: CommandContextMeta | undefined,
  desired: DesiredMetaFields,
): CommandContextMeta | undefined {
  if (!meta) return undefined;

  const out: CommandContextMeta = {};
  if (desired.channelType && meta.channelType !== undefined) out.channelType = meta.channelType;
  if (desired.channelNsfw && meta.channelNsfw !== undefined) out.channelNsfw = meta.channelNsfw;
  if (desired.memberPermissions && meta.memberPermissions !== undefined) {
    out.memberPermissions = meta.memberPermissions;
  }
  if (desired.clientPermissions && meta.clientPermissions !== undefined) {
    out.clientPermissions = meta.clientPermissions;
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

/** Apply {@link ResolvedDesiredProperties} to a fully-built command context. */
export function slimCommandContext(
  ctx: CommandContext,
  desired: ResolvedDesiredProperties,
): CommandContext {
  const slim: CommandContext = {
    kind: ctx.kind,
    commandName: ctx.commandName,
    userId: ctx.userId,
    guildId: ctx.guildId,
    channelId: ctx.channelId,
    raw: desired.context.raw ? ctx.raw : null,
    reply: ctx.reply,
    replyEphemeral: ctx.replyEphemeral,
  };

  if (desired.context.meta) {
    const meta = slimMeta(ctx.meta, desired.meta);
    if (meta !== undefined) Object.assign(slim, { meta });
  }

  if (desired.context.argsText && ctx.argsText !== undefined) {
    Object.assign(slim, { argsText: ctx.argsText });
  }

  if (desired.context.slashOptions && ctx.slashOptions !== undefined && ctx.slashOptions.length > 0) {
    Object.assign(slim, { slashOptions: ctx.slashOptions });
  }

  if (desired.context.slashPath && ctx.slashPath !== undefined) {
    Object.assign(slim, { slashPath: ctx.slashPath });
  }

  return slim;
}
