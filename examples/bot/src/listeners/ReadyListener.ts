import { Hook, type Registry } from "@stambha/core";

export class ReadyListener extends Hook {
  constructor(registry: Registry<Hook>) {
    super(registry, { name: "ready-log", event: "ready", once: true });
  }

  handle(payload: unknown): void {
    const user = (payload as { user?: { id: string; username?: string } })?.user;
    const label = user?.username ?? user?.id ?? "unknown";
    console.log(`[listener:ready] Logged in as ${label}`);
  }
}
