import type { CommandContextMeta } from "./meta.js";
import type { ArgsText, SlashOption } from "./args.js";
import type { CommandSlashPath } from "../command/slashTypes.js";

/** How the user invoked a command. */
export type CommandKind = "slash" | "prefix" | "contextMenu" | "message";

/** Normalized context for command execution (transport-agnostic). */
export interface CommandContext {
  readonly kind: CommandKind;
  readonly commandName: string;
  readonly userId: string;
  readonly guildId: string | null;
  readonly channelId: string | null;
  /** Populated by transport bridges for permission / channel gates. */
  readonly meta?: CommandContextMeta;
  /** Prefix commands: raw argument string after the command name. */
  readonly argsText?: ArgsText;
  /** Slash commands: normalized option values from the interaction. */
  readonly slashOptions?: readonly SlashOption[];
  /** Slash commands: root / group / subcommand path. */
  readonly slashPath?: CommandSlashPath;
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

/** Context for scheduled Chron tasks. */
export interface ChronContext {
  readonly chron: string;
  readonly client: import("../client/StambhaClient.js").StambhaClient;
  readonly runAt: Date;
}

/** Payload passed to Epilogue hooks after command execution. */
export interface EpilogueContext {
  readonly commandName: string;
  readonly ctx: CommandContext;
  readonly outcome: import("../outcome/Outcome.js").Outcome<unknown>;
  readonly durationMs: number;
}

/** @deprecated Use {@link CommandKind} */
export type DirectiveKind = CommandKind;

/** @deprecated Use {@link CommandContext} */
export type DirectiveContext = CommandContext;
