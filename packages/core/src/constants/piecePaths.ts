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
  /** Stratum: Scouts (Klasa: `monitors/`) */
  scouts: "src/scouts",
  /** Stratum: Barriers (Klasa: `inhibitors/`) */
  barriers: "src/barriers",
  /** Stratum: Gates (Sapphire: `preconditions/`) */
  gates: "src/gates",
  /** Sapphire: `preconditions/` (alias for gates) */
  preconditions: "src/gates",
  /** Stratum: Epilogues (Klasa: `finalizers/`) */
  epilogues: "src/epilogues",
  /** Klasa: `finalizers/` (alias for epilogues) */
  finalizers: "src/epilogues",
  /** Stratum: Conduits (middleware) */
  conduits: "src/conduits",
  /** Stratum: Signals (buttons, modals, selects) */
  signals: "src/signals",
  /** Klasa: `tasks/` — Stratum: Chron */
  tasks: "src/tasks",
} as const;

export type PiecePathKey = keyof typeof PiecePaths;
