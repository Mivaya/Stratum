/** Result type for directive execution and gate checks. */
export type Outcome<T, E = StratumError> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(outcome: Outcome<T, E>): outcome is Ok<T> {
  return outcome.ok;
}

export function isErr<T, E>(outcome: Outcome<T, E>): outcome is Err<E> {
  return !outcome.ok;
}

export class StratumError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "StratumError";
  }
}
