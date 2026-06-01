import { join, readDir, type DirEntry } from "@stratum/runtime";

const JS_EXT = /\.(js|mjs|cjs|ts|mts|cts)$/;

export async function scanFiles(dir: string): Promise<string[]> {
  const entries = await readDir(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await scanFiles(full)));
    } else if (entry.isFile() && JS_EXT.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }

  return files;
}

export type { DirEntry };
