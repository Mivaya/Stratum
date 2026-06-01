/** Promise-based delay using the global timer (available in Node, Bun, Deno). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type TimerHandle = ReturnType<typeof setTimeout>;

export function delay(ms: number, fn: () => void): TimerHandle {
  return setTimeout(fn, ms);
}

export function cancelDelay(handle: TimerHandle): void {
  clearTimeout(handle);
}
