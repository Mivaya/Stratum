import type { FieldSchema } from "./field.js";
import { VaultError } from "../errors.js";

export function validateData(
  shape: Record<string, FieldSchema>,
  data: unknown,
): Record<string, unknown> {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new VaultError("Record data must be a plain object.");
  }

  const input = data as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, schema] of Object.entries(shape)) {
    const value = input[key] ?? generateDefault(schema);
    out[key] = validateField(key, schema, value);
  }

  return out;
}

function validateField(key: string, schema: FieldSchema, value: unknown): unknown {
  if (value === null || value === undefined) {
    if (schema.nullable) return null;
    if (value === undefined) return generateDefault(schema);
    throw new VaultError(`[${key}] cannot be null.`);
  }

  switch (schema.type) {
    case "string":
      if (typeof value !== "string") throw new VaultError(`[${key}] must be a string.`);
      return value;
    case "number": {
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new VaultError(`[${key}] must be a number.`);
      }
      if (schema.min !== undefined && value < schema.min) {
        throw new VaultError(`[${key}] must be >= ${schema.min}.`);
      }
      if (schema.max !== undefined && value > schema.max) {
        throw new VaultError(`[${key}] must be <= ${schema.max}.`);
      }
      return value;
    }
    case "boolean":
      if (typeof value !== "boolean") throw new VaultError(`[${key}] must be a boolean.`);
      return value;
    case "array":
      if (!Array.isArray(value)) throw new VaultError(`[${key}] must be an array.`);
      if (!schema.item) return value;
      return value.map((item, i) => validateField(`${key}[${i}]`, schema.item!, item));
    case "object": {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new VaultError(`[${key}] must be an object.`);
      }
      if (!schema.fields) return value;
      return validateData(schema.fields, value);
    }
    default:
      return value;
  }
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
