import { defineGate, type GateLike } from "@stratum/core";
import {
  formatMissingPermissions,
  hasPermissions,
  type PermissionFlag,
} from "./permissions.js";

export interface PermissionsGateOptions {
  /** Permissions the invoking member must have. */
  user?: bigint | PermissionFlag | PermissionFlag[];
  /** Permissions the bot must have in the channel. */
  client?: bigint | PermissionFlag | PermissionFlag[];
  userMessage?: string;
  clientMessage?: string;
}

function resolveFlags(input: bigint | PermissionFlag | PermissionFlag[]): bigint {
  if (typeof input === "bigint") return input;
  if (Array.isArray(input)) {
    let result = 0n;
    for (const flag of input) result |= flag;
    return result;
  }
  return input;
}

/**
 * Gate that checks member and/or bot permission bitfields on {@link CommandContext.meta}.
 * Inspired by Sapphire's UserPermissions and ClientPermissions preconditions.
 */
export function permissionsGate(options: PermissionsGateOptions): GateLike {
  const userNeed = options.user !== undefined ? resolveFlags(options.user) : 0n;
  const clientNeed = options.client !== undefined ? resolveFlags(options.client) : 0n;

  return defineGate("permissions", (ctx) => {
    if (userNeed !== 0n) {
      const have = ctx.meta?.memberPermissions;
      if (!hasPermissions(have, userNeed)) {
        const missing = formatMissingPermissions(have, userNeed);
        return {
          allow: false,
          reason:
            options.userMessage ??
            `You need the following permissions: ${missing}.`,
        };
      }
    }

    if (clientNeed !== 0n) {
      const have = ctx.meta?.clientPermissions;
      if (!hasPermissions(have, clientNeed)) {
        const missing = formatMissingPermissions(have, clientNeed);
        return {
          allow: false,
          reason:
            options.clientMessage ??
            `I need the following permissions: ${missing}.`,
        };
      }
    }

    return { allow: true };
  });
}

/** Shorthand: member must have the given permissions. */
export function userPermissionsGate(
  permissions: bigint | PermissionFlag | PermissionFlag[],
  message?: string,
): GateLike {
  const options: PermissionsGateOptions = { user: permissions };
  if (message !== undefined) options.userMessage = message;
  return permissionsGate(options);
}

/** Shorthand: bot must have the given permissions in the channel. */
export function clientPermissionsGate(
  permissions: bigint | PermissionFlag | PermissionFlag[],
  message?: string,
): GateLike {
  const options: PermissionsGateOptions = { client: permissions };
  if (message !== undefined) options.clientMessage = message;
  return permissionsGate(options);
}
