/** Minimal logger interface (Sapphire `@sapphire/plugin-logger` aligned). */
export interface StambhaLogger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

/** DI + logger surface for plugins and pieces. */
export interface StambhaContainerLike {
  readonly binder: import("../binder/Binder.js").Binder;
  readonly logger: StambhaLogger;
}
