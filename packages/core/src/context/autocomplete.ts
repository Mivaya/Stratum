import type { CommandSlashPath } from "../command/slashTypes.js";

export interface AutocompleteChoice {
  name: string;
  value: string;
}

/** Context for slash autocomplete interactions. */
export interface AutocompleteContext {
  readonly commandName: string;
  readonly slashPath?: CommandSlashPath;
  readonly focusedOption: string;
  readonly userInput: string;
  readonly userId: string;
  readonly guildId: string | null;
  readonly channelId: string | null;
  readonly raw: unknown;
  respond(choices: AutocompleteChoice[]): Promise<void>;
}
