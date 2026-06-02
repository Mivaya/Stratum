import { DISCORD_API_BASE, DISCORD_API_VERSION } from "./constants.js";

/** Discord snowflake identifier (string at runtime). */
export type Snowflake = string;

/** Bot credentials and identity for REST / gateway sessions. */
export interface SessionInfo {
  readonly token: string;
  readonly applicationId?: Snowflake;
  readonly userId?: Snowflake;
  readonly apiVersion: typeof DISCORD_API_VERSION;
  readonly apiBaseUrl: string;
}

export interface CreateSessionOptions {
  token: string;
  applicationId?: Snowflake;
  userId?: Snowflake;
  /** Override API base (tests / canary). Defaults to {@link DISCORD_API_BASE}. */
  apiBaseUrl?: string;
}

/** Build a frozen session descriptor for REST or gateway workers. */
export function createSession(options: CreateSessionOptions): SessionInfo {
  const session: SessionInfo = {
    token: options.token,
    apiVersion: DISCORD_API_VERSION,
    apiBaseUrl: options.apiBaseUrl ?? DISCORD_API_BASE,
  };
  if (options.applicationId !== undefined) {
    (session as { applicationId?: Snowflake }).applicationId = options.applicationId;
  }
  if (options.userId !== undefined) {
    (session as { userId?: Snowflake }).userId = options.userId;
  }
  return Object.freeze(session);
}
