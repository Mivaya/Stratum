import type { FieldSchema, InferBlueprint } from "./field.js";
import { validateData } from "./validate.js";

export class Blueprint<T extends Record<string, FieldSchema> = Record<string, FieldSchema>> {
  readonly version = 1;

  constructor(readonly shape: T) {}

  defaults(): InferBlueprint<T> {
    const out: Record<string, unknown> = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      out[key] = generateDefault(schema);
    }
    return out as InferBlueprint<T>;
  }

  validate(data: unknown): InferBlueprint<T> {
    return validateData(this.shape, data) as InferBlueprint<T>;
  }

  patch(
    current: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): InferBlueprint<T> {
    const merged = { ...current, ...patch };
    return this.validate(merged);
  }
}

export function defineBlueprint<T extends Record<string, FieldSchema>>(shape: T): Blueprint<T> {
  const built: Record<string, FieldSchema> = {};
  for (const [key, value] of Object.entries(shape)) {
    built[key] =
      typeof value === "object" && value !== null && "build" in value
        ? (value as { build: () => FieldSchema }).build()
        : (value as FieldSchema);
  }
  return new Blueprint(built as T);
}

function generateDefault(schema: FieldSchema): unknown {
  if (schema.default !== undefined) return schema.default;
  if (schema.nullable) return null;

  switch (schema.type) {
    case "string":
      return "";
    case "number":
      return schema.min ?? 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object": {
      if (!schema.fields) return {};
      const obj: Record<string, unknown> = {};
      for (const [k, f] of Object.entries(schema.fields)) {
        obj[k] = generateDefault(f);
      }
      return obj;
    }
    default:
      return null;
  }
}
