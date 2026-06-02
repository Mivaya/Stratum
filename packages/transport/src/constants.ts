/** Discord REST API version used by Stratum transport. */
export const DISCORD_API_VERSION = "10" as const;

/** Default Discord REST base URL (no trailing slash). */
export const DISCORD_API_BASE = `https://discord.com/api/v${DISCORD_API_VERSION}`;
