import { err, ok, type Outcome } from "@stratum/core";

export type ArgErrorCode = "MISSING" | "INVALID" | "UNKNOWN_TYPE";

export interface ArgError {
  code: ArgErrorCode;
  message: string;
  parameter?: string;
}

export type ArgResult<T> = Outcome<T, ArgError>;

export function argMissing(message = "Missing required argument."): ArgResult<never> {
  return err({ code: "MISSING", message });
}

export function argInvalid(parameter: string, message: string): ArgResult<never> {
  return err({ code: "INVALID", message, parameter });
}

export function argOk<T>(value: T): ArgResult<T> {
  return ok(value);
}

export class ArgParseError extends Error {
  readonly code: ArgErrorCode;
  readonly parameter?: string;

  constructor(error: ArgError) {
    super(error.message);
    this.name = "ArgParseError";
    this.code = error.code;
    if (error.parameter !== undefined) this.parameter = error.parameter;
  }
}

export function unwrapArg<T>(result: ArgResult<T>): T {
  if (!result.ok) throw new ArgParseError(result.error);
  return result.value;
}
