import { detectRuntime } from "./detect.js";

declare const Deno: {
  readDir(path: string): AsyncIterable<{ name: string; isDirectory: boolean; isFile: boolean }>;
} | undefined;

export interface DirEntry {
  readonly name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

/** List directory entries (files and folders). Returns `[]` when the path is missing. */
export async function readDir(dirPath: string): Promise<DirEntry[]> {
  if (detectRuntime() === "deno") {
    try {
      const entries: DirEntry[] = [];
      for await (const entry of Deno!.readDir(dirPath)) {
        entries.push({
          name: entry.name,
          isDirectory: () => entry.isDirectory,
          isFile: () => entry.isFile,
        });
      }
      return entries;
    } catch {
      return [];
    }
  }

  try {
    const { readdir } = await import("node:fs/promises");
    return readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
}
