import type { StambhaClient } from "@stambha/core";
export type PieceKind =
  | "commands"
  | "listeners"
  | "scouts"
  | "barriers"
  | "gates"
  | "epilogues"
  | "conduits"
  | "signals"
  | "tasks";

export interface LoaderContext {
  client: StambhaClient;
  vault?: unknown;
  [key: string]: unknown;
}

export type PieceConstructor = new (...args: never[]) => { name: string };

export interface LoadPiecesOptions {
  /** Project root (default: process.cwd()) */
  basePath?: string;
  /** Extra context passed to piece factories */
  context?: LoaderContext;
  /** Override paths per kind (defaults from PiecePaths) */
  paths?: Partial<Record<PieceKind, string | false>>;
}

export interface LoadPiecesResult {
  loaded: Record<PieceKind, string[]>;
  errors: { file: string; error: unknown }[];
}
