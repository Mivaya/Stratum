import { Signal, type Command, type CommandSlashPath, type StratumClient } from "@stratum/core";

/** Unified interaction kinds (slash autocomplete vs component/modal signals). */
export type InteractionKind = "autocomplete" | "signal";

export type InteractionTarget =
  | { kind: "autocomplete"; command: Command; path: CommandSlashPath }
  | { kind: "signal"; signal: Signal };

/**
 * Resolve slash autocomplete to a command (uses {@link CommandIndex.resolveSlash}).
 * Signals stay on {@link StratumClient.registries.signals} — use {@link resolveSignal} for those.
 */
export function resolveAutocompleteCommand(
  client: StratumClient,
  path: CommandSlashPath,
): Command | undefined {
  return client.commandIndex.resolveSlash(path);
}

/** Find a registered signal by Discord custom id (`stratum:{name}[:suffix]`). */
export function resolveSignal(client: StratumClient, customId: string): Signal | undefined {
  const parsed = Signal.parseCustomId(customId);
  if (!parsed) return undefined;
  return client.registries.signals.get(parsed.name);
}

/** Thin facade for bridges — autocomplete vs signal routing. */
export function resolveInteractionTarget(
  client: StratumClient,
  input: { kind: "autocomplete"; path: CommandSlashPath } | { kind: "signal"; customId: string },
): InteractionTarget | undefined {
  if (input.kind === "autocomplete") {
    const command = resolveAutocompleteCommand(client, input.path);
    if (!command) return undefined;
    return { kind: "autocomplete", command, path: input.path };
  }
  const signal = resolveSignal(client, input.customId);
  if (!signal) return undefined;
  return { kind: "signal", signal };
}
