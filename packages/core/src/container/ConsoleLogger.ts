import type { StambhaLogger } from "./types.js";

export class ConsoleLogger implements StambhaLogger {
  debug(message: string, meta?: unknown): void {
    if (meta !== undefined) console.debug(`[stambha:debug] ${message}`, meta);
    else console.debug(`[stambha:debug] ${message}`);
  }

  info(message: string, meta?: unknown): void {
    if (meta !== undefined) console.info(`[stambha] ${message}`, meta);
    else console.info(`[stambha] ${message}`);
  }

  warn(message: string, meta?: unknown): void {
    if (meta !== undefined) console.warn(`[stambha:warn] ${message}`, meta);
    else console.warn(`[stambha:warn] ${message}`);
  }

  error(message: string, meta?: unknown): void {
    if (meta !== undefined) console.error(`[stambha:error] ${message}`, meta);
    else console.error(`[stambha:error] ${message}`);
  }
}
