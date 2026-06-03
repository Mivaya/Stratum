import type { CommandContext } from "@stambha/core";
import type { ArgResult } from "./errors.js";
import { argMissing } from "./errors.js";
import { joinFrom, tokenize } from "./lexer.js";
import {
  defaultArgRegistry,
  type ArgResolver,
  type BuiltinArgType,
} from "./resolvers.js";

export class Args {
  private index = 0;

  readonly source: string;
  readonly tokens: readonly string[];

  constructor(source: string, tokens?: readonly string[]) {
    this.source = source;
    this.tokens = tokens ?? tokenize(source);
  }

  static fromText(text: string): Args {
    return new Args(text, tokenize(text));
  }

  static fromContext(ctx: CommandContext): Args {
    return Args.fromText(ctx.argsText ?? "");
  }

  get finished(): boolean {
    return this.index >= this.tokens.length;
  }

  get remaining(): number {
    return Math.max(0, this.tokens.length - this.index);
  }

  peek(): string | undefined {
    return this.tokens[this.index];
  }

  /** Save cursor position for backtracking. */
  save(): number {
    return this.index;
  }

  restore(state: number): this {
    this.index = state;
    return this;
  }

  reset(): this {
    this.index = 0;
    return this;
  }

  pickResult<T>(resolver: ArgResolver<T>): ArgResult<T> {
    const parameter = this.tokens[this.index];
    if (parameter === undefined) {
      return argMissing("Missing required argument.");
    }

    const result = resolver(parameter);
    if (result.ok) this.index++;
    return result;
  }

  pick<T>(resolver: ArgResolver<T>): ArgResult<T> {
    return this.pickResult(resolver);
  }

  pickType(type: BuiltinArgType | string): ArgResult<unknown> {
    const parameter = this.tokens[this.index];
    if (parameter === undefined) {
      return argMissing("Missing required argument.");
    }

    const registry = defaultArgRegistry;
    const result = registry.resolve(type, parameter);
    if (result.ok) this.index++;
    return result;
  }

  maybeResult<T>(resolver: ArgResolver<T>): ArgResult<T | null> {
    const parameter = this.peek();
    if (parameter === undefined) return { ok: true, value: null };
    return this.pickResult(resolver);
  }

  maybeType(type: BuiltinArgType | string): ArgResult<unknown | null> {
    if (this.finished) return { ok: true, value: null };
    return this.pickType(type);
  }

  /** All remaining tokens joined with spaces. */
  rest(): string {
    return joinFrom(this.tokens, this.index);
  }

  pickRest(): ArgResult<string> {
    if (this.finished) return argMissing("Missing required argument.");
    const value = this.rest();
    this.index = this.tokens.length;
    return { ok: true, value };
  }
}
