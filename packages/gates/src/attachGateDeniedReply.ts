import type { StratumClient } from "@stratum/core";

export interface AttachGateDeniedReplyOptions {
  /** Use ephemeral replies for slash commands (default `true`). */
  ephemeral?: boolean;
  /** Skip auto-reply when the gate sets `silent: true` (future; gates currently use reason only). */
  respectSilent?: boolean;
}

/**
 * Listen for `commandDenied` and send the gate message to the user.
 * Register once after creating the Stratum client.
 */
export function attachGateDeniedReply(
  client: StratumClient,
  options: AttachGateDeniedReplyOptions = {},
): () => void {
  const ephemeral = options.ephemeral ?? true;

  const handler = async (payload: {
    ctx: import("@stratum/core").CommandContext;
    error: { message: string; silent: boolean; gate: string };
  }) => {
    if (options.respectSilent !== false && payload.error.silent) return;

    const { ctx, error } = payload;
    try {
      if (ephemeral && ctx.kind === "slash") {
        await ctx.replyEphemeral(error.message);
      } else {
        await ctx.reply(error.message);
      }
    } catch (replyError) {
      console.error("[stratum/gates] Failed to send gate denial reply:", replyError);
    }
  };

  client.on("commandDenied", handler);
  return () => client.off("commandDenied", handler);
}
