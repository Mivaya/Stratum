/** Discord application command option type constants (API v10). */
export const SlashOptionType = {
  Subcommand: 1,
  SubcommandGroup: 2,
  String: 3,
  Integer: 4,
  Boolean: 5,
  User: 6,
  Channel: 7,
  Role: 8,
  Mentionable: 9,
  Number: 10,
  Attachment: 11,
} as const;

export type SlashOptionTypeValue = (typeof SlashOptionType)[keyof typeof SlashOptionType];

export interface SlashChoiceDefinition {
  name: string;
  value: string | number;
}

/** Leaf slash option on a command or subcommand. */
export interface SlashOptionDefinition {
  name: string;
  description: string;
  type: Exclude<SlashOptionTypeValue, 1 | 2>;
  required?: boolean;
  autocomplete?: boolean;
  choices?: SlashChoiceDefinition[];
  minValue?: number;
  maxValue?: number;
}

export interface SubcommandDefinition {
  name: string;
  description: string;
  options?: SlashOptionDefinition[];
}

export interface SubcommandGroupDefinition {
  name: string;
  description: string;
  subcommands: SubcommandDefinition[];
}

/** Transport-agnostic slash command body for deploy. */
export interface ApplicationCommandJSON {
  name: string;
  description: string;
  type?: 1;
  options?: ApplicationCommandOptionJSON[];
  default_member_permissions?: string | null;
  dm_permission?: boolean;
}

export interface ApplicationCommandOptionJSON {
  name: string;
  description: string;
  type: SlashOptionTypeValue;
  required?: boolean;
  autocomplete?: boolean;
  choices?: SlashChoiceDefinition[];
  min_value?: number;
  max_value?: number;
  options?: ApplicationCommandOptionJSON[];
}

/** Resolved slash invocation path (root / group / subcommand). */
export interface CommandSlashPath {
  root: string;
  group?: string;
  subcommand?: string;
}
