/** Normalized slash command option value kind (runtime context). */
export type ParsedSlashOptionType =
  | "string"
  | "integer"
  | "number"
  | "boolean"
  | "user"
  | "channel"
  | "role"
  | "mentionable"
  | "attachment";

export interface SlashOption {
  readonly name: string;
  readonly type: ParsedSlashOptionType;
  /** User/channel/role IDs are strings; attachments may be string IDs. */
  readonly value: string | number | boolean;
}

/** Prefix argument text after the command name (without leading prefix). */
export type ArgsText = string;
