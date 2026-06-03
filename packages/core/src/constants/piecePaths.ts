/**
 * Default source folders aligned with Sapphire + Klasa conventions.
 * Used by the piece loader (future) and documented for manual project layout.
 */
export const PiecePaths = {
  /** Sapphire: `commands/` — Klasa: `commands/` */
  commands: "src/commands",
  /** Sapphire: `listeners/` — Klasa: `events/` */
  listeners: "src/listeners",
  /** Klasa: `events/` (alias for listeners) */
  events: "src/listeners",
  /** Stambha: Scouts (Klasa: `monitors/`) */
  scouts: "src/scouts",
  /** Stambha: Barriers (Klasa: `inhibitors/`) */
  barriers: "src/barriers",
  /** Stambha: Gates (Sapphire: `preconditions/`) */
  gates: "src/gates",
  /** Sapphire: `preconditions/` (alias for gates) */
  preconditions: "src/gates",
  /** Stambha: Epilogues (Klasa: `finalizers/`) */
  epilogues: "src/epilogues",
  /** Klasa: `finalizers/` (alias for epilogues) */
  finalizers: "src/epilogues",
  /** Stambha: Conduits (middleware) */
  conduits: "src/conduits",
  /** Stambha: Signals (buttons, modals, selects) */
  signals: "src/signals",
  /** Klasa: `tasks/` — Stambha: Chron */
  tasks: "src/tasks",
  /** Vault blueprints / ledger schemas */
  schemas: "src/schemas",
} as const;

export type PiecePathKey = keyof typeof PiecePaths;
