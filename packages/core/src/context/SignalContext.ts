/** Context for component interactions (buttons, selects, modals). */
export interface SignalContext {
  readonly signalName: string;
  readonly userId: string;
  readonly guildId: string | null;
  readonly channelId: string | null;
  readonly customId: string;
  readonly raw: unknown;
  reply(text: string): Promise<void>;
  replyEphemeral(text: string): Promise<void>;
  deferReply?(): Promise<void>;
}
