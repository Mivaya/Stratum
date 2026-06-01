/** Transport-agnostic user slice. */
export interface StratumUser {
  readonly id: string;
  readonly bot?: boolean;
  readonly username?: string;
}

/** Transport-agnostic message slice for routing. */
export interface StratumMessage {
  readonly id: string | null;
  readonly content: string;
  readonly channelId: string | null;
  readonly guildId: string | null;
  readonly author: StratumUser;
}

/** Transport-agnostic slash interaction slice. */
export interface StratumSlashInteraction {
  readonly id: string | null;
  readonly token: string | null;
  readonly user: StratumUser;
  readonly guildId: string | null;
  readonly channelId: string | null;
}
