/** Transport-agnostic user slice. */
export interface StambhaUser {
  readonly id: string;
  readonly bot?: boolean;
  readonly username?: string;
}

/** Transport-agnostic message slice for routing. */
export interface StambhaMessage {
  readonly id: string | null;
  readonly content: string;
  readonly channelId: string | null;
  readonly guildId: string | null;
  readonly author: StambhaUser;
}

/** Transport-agnostic slash interaction slice. */
export interface StambhaSlashInteraction {
  readonly id: string | null;
  readonly token: string | null;
  readonly user: StambhaUser;
  readonly guildId: string | null;
  readonly channelId: string | null;
}
