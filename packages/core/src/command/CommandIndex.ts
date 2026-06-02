import type { Command } from "../registries/Command.js";
import type { CommandSlashPath } from "./slashTypes.js";

/** Prefix alias resolution and slash path → command lookup. */
export class CommandIndex {
  private readonly aliasToPrimary = new Map<string, string>();
  private readonly slashByPath = new Map<string, Command>();
  private readonly topLevel = new Map<string, Command>();

  static pathKey(path: CommandSlashPath): string {
    return [path.root, path.group ?? "", path.subcommand ?? ""].join(":");
  }

  rebuild(commands: Iterable<Command>): void {
    this.aliasToPrimary.clear();
    this.slashByPath.clear();
    this.topLevel.clear();

    for (const command of commands) {
      if (!command.enabled) continue;

      for (const alias of command.aliases) {
        const key = alias.toLowerCase();
        if (this.aliasToPrimary.has(key) && this.aliasToPrimary.get(key) !== command.name) {
          throw new Error(
            `[commands] Alias "${alias}" conflicts between "${this.aliasToPrimary.get(key)}" and "${command.name}".`,
          );
        }
        this.aliasToPrimary.set(key, command.name);
      }

      if (!command.kinds.includes("slash")) continue;

      if (command.subcommands.length > 0 || command.subcommandGroups.length > 0) {
        this.topLevel.set(command.name, command);
        for (const sub of command.subcommands) {
          this.slashByPath.set(
            CommandIndex.pathKey({ root: command.name, subcommand: sub.name }),
            command,
          );
        }
        for (const group of command.subcommandGroups) {
          for (const sub of group.subcommands) {
            this.slashByPath.set(
              CommandIndex.pathKey({ root: command.name, group: group.name, subcommand: sub.name }),
              command,
            );
          }
        }
        continue;
      }

      if (command.slashRoot) {
        const path: CommandSlashPath = {
          root: command.slashRoot,
          subcommand: command.slashSubcommand ?? command.name,
        };
        if (command.slashGroup) path.group = command.slashGroup;
        this.slashByPath.set(CommandIndex.pathKey(path), command);
        continue;
      }

      this.topLevel.set(command.name, command);
      this.slashByPath.set(CommandIndex.pathKey({ root: command.name }), command);
    }
  }

  resolvePrefixName(name: string): string {
    return this.aliasToPrimary.get(name.toLowerCase()) ?? name;
  }

  resolveSlash(path: CommandSlashPath): Command | undefined {
    if (path.subcommand || path.group) {
      return this.slashByPath.get(CommandIndex.pathKey(path));
    }
    return (
      this.slashByPath.get(CommandIndex.pathKey(path)) ??
      this.topLevel.get(path.root)
    );
  }

  /** Commands grouped by category for help listings. */
  byCategory(commands: Iterable<Command>): Map<string, Command[]> {
    const map = new Map<string, Command[]>();
    for (const command of commands) {
      if (!command.enabled) continue;
      const key = command.category || "General";
      const list = map.get(key) ?? [];
      list.push(command);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }
}
