import { describe, expect, it } from "vitest";
import { parseSequenceCustomId, sequenceCustomId } from "./customId.js";

describe("sequence customId", () => {
  it("round-trips session and step", () => {
    const id = sequenceCustomId("sess-1", "pick", "yes");
    expect(parseSequenceCustomId(id)).toEqual({
      sessionId: "sess-1",
      stepId: "pick",
      part: "yes",
    });
    expect(parseSequenceCustomId(sequenceCustomId("abc", "note__modal"))?.stepId).toBe("note__modal");
  });
});
