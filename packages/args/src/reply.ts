import type { CommandContext } from "@stratum/core";
import type { ArgError, ArgResult } from "./errors.js";

/** Send a user-facing message for a failed argument parse. */
export async function replyArgError(ctx: CommandContext, error: ArgError): Promise<void> {
  const text = error.message;
  if (ctx.kind === "slash") {
    await ctx.replyEphemeral(text);
  } else {
    await ctx.reply(text);
  }
}

/** If result failed, reply and return true (handled). */
export async function replyIfArgError<T>(
  ctx: CommandContext,
  result: ArgResult<T>,
): Promise<boolean> {
  if (result.ok) return false;
  await replyArgError(ctx, result.error);
  return true;
}
