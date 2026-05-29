export type FieldType = "string" | "number" | "boolean" | "object" | "array";

export interface FieldSchema {
  readonly type: FieldType;
  readonly default?: unknown;
  readonly nullable?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly fields?: Readonly<Record<string, FieldSchema>>;
  readonly item?: FieldSchema;
}

abstract class FieldBuilder<T extends FieldSchema> {
  protected schema: T;

  constructor(schema: T) {
    this.schema = schema;
  }

  build(): T {
    return this.schema;
  }

  default(value: unknown): this {
    this.schema = { ...this.schema, default: value };
    return this;
  }

  nullable(): this {
    this.schema = { ...this.schema, nullable: true };
    return this;
  }
}

class StringFieldBuilder extends FieldBuilder<{ type: "string"; default?: string; nullable?: boolean }> {
  constructor() {
    super({ type: "string" });
  }
}

class NumberFieldBuilder extends FieldBuilder<{
  type: "number";
  default?: number;
  nullable?: boolean;
  min?: number;
  max?: number;
}> {
  constructor() {
    super({ type: "number" });
  }

  min(value: number): this {
    this.schema = { ...this.schema, min: value };
    return this;
  }

  max(value: number): this {
    this.schema = { ...this.schema, max: value };
    return this;
  }
}

class BooleanFieldBuilder extends FieldBuilder<{ type: "boolean"; default?: boolean; nullable?: boolean }> {
  constructor() {
    super({ type: "boolean" });
  }
}

class ObjectFieldBuilder extends FieldBuilder<{
  type: "object";
  default?: Record<string, unknown>;
  nullable?: boolean;
  fields: Record<string, FieldSchema>;
}> {
  constructor(fields: Record<string, FieldSchema>) {
    super({ type: "object", fields });
  }
}

class ArrayFieldBuilder extends FieldBuilder<{
  type: "array";
  default?: unknown[];
  nullable?: boolean;
  item: FieldSchema;
}> {
  constructor(item: FieldSchema) {
    super({ type: "array", item });
  }
}

export const field = {
  string: () => new StringFieldBuilder(),
  number: () => new NumberFieldBuilder(),
  boolean: () => new BooleanFieldBuilder(),
  object: <T extends Record<string, FieldSchema>>(fields: T) => new ObjectFieldBuilder(fields),
  array: (item: FieldSchema) => new ArrayFieldBuilder(item),
};

export type InferField<S extends FieldSchema> = S["type"] extends "string"
  ? S["nullable"] extends true
    ? string | null
    : string
  : S["type"] extends "number"
    ? S["nullable"] extends true
      ? number | null
      : number
    : S["type"] extends "boolean"
      ? S["nullable"] extends true
        ? boolean | null
        : boolean
      : S["type"] extends "object"
        ? S["fields"] extends Record<string, FieldSchema>
          ? { [K in keyof S["fields"]]: InferField<S["fields"][K]> }
          : Record<string, unknown>
        : S["type"] extends "array"
          ? S["item"] extends FieldSchema
            ? InferField<S["item"]>[]
            : unknown[]
          : unknown;

export type InferBlueprint<T extends Record<string, FieldSchema>> = {
  [K in keyof T]: InferField<T[K]>;
};
