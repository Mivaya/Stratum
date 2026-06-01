import { pathToFileURL as nodePathToFileURL } from "node:url";
import { isDeno } from "./detect.js";
import { cwd } from "./env.js";

/** Join path segments with forward slashes (portable across runtimes). */
export function join(...parts: string[]): string {
  const segments: string[] = [];
  for (const part of parts) {
    for (const segment of part.split(/[/\\]/)) {
      if (segment.length > 0 && segment !== ".") {
        segments.push(segment);
      }
    }
  }
  const joined = segments.join("/");
  if (parts[0]?.startsWith("/")) return `/${joined}`;
  return joined;
}

/** Resolve a path relative to optional base (defaults to {@link cwd}). */
export function resolve(...parts: string[]): string {
  const base = parts[0]?.startsWith("/") ? "" : cwd();
  return join(base, ...parts);
}

export function basename(file: string, ext?: string): string {
  const name = file.split(/[/\\]/).pop() ?? file;
  if (ext !== undefined && name.endsWith(ext)) {
    return name.slice(0, -ext.length);
  }
  return name;
}

export function extname(file: string): string {
  const dot = file.lastIndexOf(".");
  const slash = Math.max(file.lastIndexOf("/"), file.lastIndexOf("\\"));
  if (dot <= slash) return "";
  return file.slice(dot);
}

/** Convert an absolute filesystem path to a `file://` URL for dynamic import. */
export function pathToFileURL(filePath: string): URL {
  if (isDeno()) {
    const normalized = filePath.replace(/\\/g, "/");
    if (normalized.startsWith("/")) {
      return new URL(`file://${normalized}`);
    }
    return new URL(`file:///${normalized}`);
  }
  return nodePathToFileURL(filePath);
}
