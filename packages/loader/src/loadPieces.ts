import {
  basename,
  cwd,
  extname,
  pathToFileURL,
  resolve,
} from "@stambha/runtime";
import { PiecePaths, type StambhaClient } from "@stambha/core";
import type { Command } from "@stambha/core";
import type { Hook } from "@stambha/core";
import type { Scout } from "@stambha/core";
import type { Barrier } from "@stambha/core";
import type { Gate } from "@stambha/core";
import type { Epilogue } from "@stambha/core";
import type { Conduit } from "@stambha/core";
import type { Signal } from "@stambha/core";
import type { Chron } from "@stambha/core";
import { scanFiles } from "./scan.js";
import type { LoadPiecesOptions, LoadPiecesResult, PieceKind, LoaderContext } from "./types.js";

const DEFAULT_PATHS: Record<PieceKind, string> = {
  commands: PiecePaths.commands,
  listeners: PiecePaths.listeners,
  scouts: PiecePaths.scouts,
  barriers: PiecePaths.barriers,
  gates: PiecePaths.gates,
  epilogues: PiecePaths.epilogues,
  conduits: PiecePaths.conduits,
  signals: PiecePaths.signals,
  tasks: PiecePaths.tasks,
};

/** Load gates before commands so {@link CommandOptions.gateNames} can resolve at construct time. */
const LOAD_ORDER: PieceKind[] = [
  "gates",
  "barriers",
  "conduits",
  "epilogues",
  "scouts",
  "signals",
  "tasks",
  "listeners",
  "commands",
];

/**
 * Load pieces from disk using Sapphire/Klasa folder conventions.
 */
export async function loadPieces(
  client: StambhaClient,
  options: LoadPiecesOptions = {},
): Promise<LoadPiecesResult> {
  const basePath = options.basePath ?? cwd();
  const ctx: LoaderContext = { client, ...options.context };

  const result: LoadPiecesResult = {
    loaded: {
      commands: [],
      listeners: [],
      scouts: [],
      barriers: [],
      gates: [],
      epilogues: [],
      conduits: [],
      signals: [],
      tasks: [],
    },
    errors: [],
  };

  for (const kind of LOAD_ORDER) {
    const custom = options.paths?.[kind];
    if (custom === false) continue;

    const rel = custom ?? DEFAULT_PATHS[kind];
    const abs = resolve(basePath, rel);
    const files = await scanFiles(abs);

    for (const file of files) {
      try {
        const mod = await import(pathToFileURL(file).href);
        const PieceClass = resolveExport(mod, file);
        if (!PieceClass) continue;

        registerPiece(kind, client, PieceClass, ctx);
        result.loaded[kind].push(file);
      } catch (error) {
        result.errors.push({ file, error });
      }
    }
  }

  client.resolveCommandGates();
  client.rebuildCommandIndex();
  await client.pluginLifecycle?.runHook("postLoad");
  return result;
}

function resolveExport(mod: Record<string, unknown>, file: string): (new (...a: never[]) => unknown) | null {
  if (typeof mod.default === "function") {
    return mod.default as new (...a: never[]) => unknown;
  }
  const base = basename(file, extname(file));
  const named = mod[base];
  if (typeof named === "function") return named as new (...a: never[]) => unknown;
  return null;
}

function registerPiece(
  kind: PieceKind,
  client: StambhaClient,
  PieceClass: new (...args: never[]) => unknown,
  ctx: LoaderContext,
): void {
  switch (kind) {
    case "commands": {
      const instance = instantiate(PieceClass, ctx, client.registries.commands);
      client.register(instance as Command);
      break;
    }
    case "listeners": {
      const instance = instantiate(PieceClass, ctx, client.registries.hooks);
      client.registries.hooks.register(instance as Hook);
      break;
    }
    case "scouts": {
      const instance = instantiate(PieceClass, ctx, client.registries.scouts);
      client.registries.scouts.register(instance as Scout);
      break;
    }
    case "barriers": {
      const instance = instantiate(PieceClass, ctx, client.registries.barriers);
      client.registries.barriers.register(instance as Barrier);
      break;
    }
    case "gates": {
      const instance = instantiate(PieceClass, ctx, client.registries.gates);
      client.registries.gates.register(instance as Gate);
      break;
    }
    case "epilogues": {
      const instance = instantiate(PieceClass, ctx, client.registries.epilogues);
      client.registries.epilogues.register(instance as Epilogue);
      break;
    }
    case "conduits": {
      const instance = instantiate(PieceClass, ctx, client.registries.conduits);
      client.registries.conduits.register(instance as Conduit);
      break;
    }
    case "signals": {
      const instance = instantiate(PieceClass, ctx, client.registries.signals);
      client.registries.signals.register(instance as Signal);
      break;
    }
    case "tasks": {
      const instance = instantiate(PieceClass, ctx, client.registries.chrons);
      client.registries.chrons.register(instance as Chron);
      break;
    }
  }
}

function instantiate(
  PieceClass: new (...args: never[]) => unknown,
  ctx: LoaderContext,
  registry: unknown,
): unknown {
  const factory = (PieceClass as { create?: (ctx: LoaderContext) => unknown }).create;
  if (typeof factory === "function") {
    return factory(ctx);
  }
  return new PieceClass(registry as never);
}
