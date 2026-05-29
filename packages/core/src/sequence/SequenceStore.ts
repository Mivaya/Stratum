import { randomUUID } from "node:crypto";
import type { SequenceSession } from "./types.js";

interface PendingStep {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class SequenceStore {
  private readonly sessions = new Map<string, SequenceSession>();
  private readonly pending = new Map<string, PendingStep>();

  createSession(meta: Omit<SequenceSession, "id" | "createdAt">): SequenceSession {
    const session: SequenceSession = {
      ...meta,
      id: randomUUID(),
      createdAt: Date.now(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): SequenceSession | undefined {
    return this.sessions.get(sessionId);
  }

  endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    for (const key of this.pending.keys()) {
      if (key.startsWith(`${sessionId}:`)) {
        const p = this.pending.get(key);
        if (p) {
          clearTimeout(p.timer);
          p.reject(new Error("Sequence ended."));
          this.pending.delete(key);
        }
      }
    }
  }

  waitForStep(sessionId: string, stepId: string, timeoutMs: number): Promise<unknown> {
    const key = `${sessionId}:${stepId}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(key);
        reject(new Error(`Sequence step "${stepId}" timed out.`));
      }, timeoutMs);

      this.pending.set(key, {
        resolve,
        reject,
        timer,
      });
    });
  }

  /** Called when a component interaction completes a step. Returns true if handled. */
  completeStep(
    sessionId: string,
    stepId: string,
    userId: string,
    value: unknown,
  ): "ok" | "wrong_user" | "unknown" {
    const session = this.sessions.get(sessionId);
    if (!session) return "unknown";
    if (session.userId !== userId) return "wrong_user";

    const key = `${sessionId}:${stepId}`;
    const pending = this.pending.get(key);
    if (!pending) return "unknown";

    clearTimeout(pending.timer);
    this.pending.delete(key);
    pending.resolve(value);
    return "ok";
  }

  cancelAll(sessionId: string): void {
    this.endSession(sessionId);
  }
}
