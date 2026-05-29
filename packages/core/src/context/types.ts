/** How the user invoked a directive. */
export type DirectiveKind = "slash" | "prefix" | "contextMenu" | "message";

/** Normalized context for directive execution (transport-agnostic). */
export interface DirectiveContext {
  readonly kind: DirectiveKind;
  readonly directiveName: string;
  readonly userId: string;
  readonly guildId: string | null;
  readonly channelId: string | null;
  readonly raw: unknown;
  reply(text: string): Promise<void>;
  replyEphemeral(text: string): Promise<void>;
}

/** Context for Scout passive watchers. */
export interface ScoutContext {
  readonly trigger: ScoutTrigger;
  readonly userId: string | null;
  readonly guildId: string | null;
  readonly channelId: string | null;
  readonly content: string | null;
  readonly raw: unknown;
  delete(): Promise<void>;
}

export type ScoutTrigger = "message" | "messageUpdate" | "interaction";

/** Payload passed to Epilogue hooks after directive execution. */
export interface EpilogueContext {
  readonly directiveName: string;
  readonly ctx: DirectiveContext;
  readonly outcome: import("../outcome/Outcome.js").Outcome<unknown>;
  readonly durationMs: number;
}
