import { describe, expect, it } from "vitest";
import { InteractionTypes } from "@discordeno/bot";
import { isApplicationCommand, isMessageComponent } from "./context.js";

describe("discordeno interaction helpers", () => {
  it("detects application commands", () => {
    expect(isApplicationCommand({ type: InteractionTypes.ApplicationCommand })).toBe(true);
    expect(isApplicationCommand({ type: InteractionTypes.MessageComponent })).toBe(false);
  });

  it("detects message components", () => {
    expect(isMessageComponent({ type: InteractionTypes.MessageComponent })).toBe(true);
  });
});
