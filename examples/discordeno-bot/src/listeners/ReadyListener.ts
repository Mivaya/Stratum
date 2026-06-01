import { Hook, type Registry } from "@stratum/core";

export class ReadyListener extends Hook {
  constructor(registry: Registry<Hook>) {
    super(registry, { name: "ready", event: "ready", once: true });
  }

  handle(): void {
    console.log("[discordeno] ready hook fired");
  }
}
