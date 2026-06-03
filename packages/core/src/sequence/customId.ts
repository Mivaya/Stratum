const PREFIX = "stambha:seq:";
const SEP = "|";

export function sequenceCustomId(sessionId: string, stepId: string, part?: string): string {
  const base = `${PREFIX}${sessionId}${SEP}${stepId}`;
  return part ? `${base}${SEP}${part}` : base;
}

export function parseSequenceCustomId(
  customId: string,
): { sessionId: string; stepId: string; part?: string } | null {
  if (!customId.startsWith(PREFIX)) return null;
  const parts = customId.slice(PREFIX.length).split(SEP);
  if (parts.length < 2 || !parts[0] || !parts[1]) return null;
  const sessionId = parts[0];
  const stepId = parts[1];
  const part = parts[2];
  return { sessionId, stepId, part };
}

export function isSequenceCustomId(customId: string): boolean {
  return customId.startsWith(PREFIX);
}
