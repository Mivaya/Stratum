import type { StambhaClient } from "../client/StambhaClient.js";
import type { Command } from "../registries/Command.js";
import type { Gate, GateLike } from "../registries/Gate.js";

/** Gates registered with {@link GateOptions.global} run on every command. */
export function globalGates(client: StambhaClient): Gate[] {
  return client.registries.gates
    .sortedByPriority((g) => g.priority)
    .filter((g) => g.global);
}

/** Resolve {@link CommandOptions.gateNames} against the gate registry. */
export function resolveNamedGates(client: StambhaClient, command: Command): GateLike[] {
  const names = command.gateNames;
  if (!names.length) return [];

  const resolved: GateLike[] = [];
  for (const name of names) {
    const gate = client.registries.gates.get(name);
    if (!gate) {
      throw new Error(
        `[gates] Command "${command.name}" references unknown gate "${name}". ` +
          `Load gates before commands or call resolveCommandGates() after loadPieces().`,
      );
    }
    resolved.push(gate);
  }
  return resolved;
}

/** Ordered gates for a command: global registry → named registry → inline. */
export function commandGatesForRun(client: StambhaClient, command: Command): GateLike[] {
  return [...globalGates(client), ...resolveNamedGates(client, command), ...command.gates];
}

/** Validate every command's {@link CommandOptions.gateNames} after pieces load. */
export function resolveCommandGates(client: StambhaClient): void {
  for (const command of client.registries.commands.values()) {
    resolveNamedGates(client, command);
  }
}
