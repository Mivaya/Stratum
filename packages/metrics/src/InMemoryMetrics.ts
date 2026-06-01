import type { CommandKind } from "@stratum/core";
import type { CommandOutcome, MetricsCollector, PieceKind } from "./types.js";

export interface CommandRecord {
  command: string;
  kind: CommandKind;
  outcome: CommandOutcome;
  durationMs?: number;
}

export class InMemoryMetrics implements MetricsCollector {
  ready = false;
  readonly commands: CommandRecord[] = [];
  readonly errors: Array<{ piece: PieceKind; name: string }> = [];

  setReady(ready: boolean): void {
    this.ready = ready;
  }

  recordCommand(event: CommandRecord): void {
    this.commands.push({ ...event });
  }

  recordPieceError(piece: PieceKind, name: string): void {
    this.errors.push({ piece, name });
  }
}
