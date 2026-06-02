import { type Outcome, ok } from "../outcome/Outcome.js";
import type { AutocompleteContext } from "../context/autocomplete.js";
import type { CommandContext, CommandKind } from "../context/types.js";
import type {
  SubcommandDefinition,
  SubcommandGroupDefinition,
  SlashOptionDefinition,
} from "../command/slashTypes.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";
import type { GateLike } from "./Gate.js";

export interface CommandOptions extends UnitOptions {
  description?: string;
  kinds?: CommandKind[];
  gates?: GateLike[];
  /** Prefix aliases (e.g. `p` for `ping`). */
  aliases?: readonly string[];
  /** Help / grouping (Sapphire-style). */
  category?: string;
  subCategory?: string;
  /** Top-level slash options (when not using subcommands). */
  slashOptions?: readonly SlashOptionDefinition[];
  /** Inline subcommands on this root command. */
  subcommands?: readonly SubcommandDefinition[];
  subcommandGroups?: readonly SubcommandGroupDefinition[];
  /** Leaf subcommand: slash root name (merged deploy). */
  slashRoot?: string;
  slashRootDescription?: string;
  slashGroup?: string;
  slashGroupDescription?: string;
  slashSubcommand?: string;
  defaultMemberPermissions?: bigint;
  dmPermission?: boolean;
}

/** User-facing command piece (Sapphire/Klasa: `commands/` folder). */
export abstract class Command extends Unit<CommandOptions> {
  readonly description: string;
  readonly kinds: CommandKind[];
  readonly gates: GateLike[];
  readonly aliases: readonly string[];
  readonly category: string;
  readonly subCategory: string;
  readonly slashOptions: readonly SlashOptionDefinition[];
  readonly subcommands: readonly SubcommandDefinition[];
  readonly subcommandGroups: readonly SubcommandGroupDefinition[];
  readonly slashRoot?: string;
  readonly slashRootDescription?: string;
  readonly slashGroup?: string;
  readonly slashGroupDescription?: string;
  readonly slashSubcommand?: string;
  readonly defaultMemberPermissions?: bigint;
  readonly dmPermission?: boolean;

  constructor(registry: Registry<Command>, options: CommandOptions) {
    super(registry, options);
    this.description = options.description ?? "";
    this.kinds = options.kinds ?? ["slash"];
    this.gates = options.gates ?? [];
    this.aliases = options.aliases ?? [];
    this.category = options.category ?? "General";
    this.subCategory = options.subCategory ?? "";
    this.slashOptions = options.slashOptions ?? [];
    this.subcommands = options.subcommands ?? [];
    this.subcommandGroups = options.subcommandGroups ?? [];
    if (options.slashRoot !== undefined) this.slashRoot = options.slashRoot;
    if (options.slashRootDescription !== undefined) {
      this.slashRootDescription = options.slashRootDescription;
    }
    if (options.slashGroup !== undefined) this.slashGroup = options.slashGroup;
    if (options.slashGroupDescription !== undefined) {
      this.slashGroupDescription = options.slashGroupDescription;
    }
    if (options.slashSubcommand !== undefined) this.slashSubcommand = options.slashSubcommand;
    if (options.defaultMemberPermissions !== undefined) {
      this.defaultMemberPermissions = options.defaultMemberPermissions;
    }
    if (options.dmPermission !== undefined) this.dmPermission = options.dmPermission;
  }

  abstract execute(ctx: CommandContext): Promise<Outcome<unknown>>;

  /** Optional slash autocomplete handler for this command. */
  autocomplete?(_ctx: AutocompleteContext): Promise<void>;

  supports(kind: CommandKind): boolean {
    return this.kinds.includes(kind);
  }

  protected success(): Outcome<void> {
    return ok(undefined);
  }
}
