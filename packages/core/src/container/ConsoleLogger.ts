import type { StratumLogger } from "./types.js";

export class ConsoleLogger implements StratumLogger {
  debug(message: string, meta?: unknown): void {
    if (meta !== undefined) console.debug(`[stratum:debug] ${message}`, meta);
    else console.debug(`[stratum:debug] ${message}`);
  }

  info(message: string, meta?: unknown): void {
    if (meta !== undefined) console.info(`[stratum] ${message}`, meta);
    else console.info(`[stratum] ${message}`);
  }

  warn(message: string, meta?: unknown): void {
    if (meta !== undefined) console.warn(`[stratum:warn] ${message}`, meta);
    else console.warn(`[stratum:warn] ${message}`);
  }

  error(message: string, meta?: unknown): void {
    if (meta !== undefined) console.error(`[stratum:error] ${message}`, meta);
    else console.error(`[stratum:error] ${message}`);
  }
}
