/** Discord REST body for `POST /channels/{id}/messages`. */
export function channelMessageBody(content: string): { content: string } {
  return { content };
}

/** Discord interaction callback payload (type 4 = channel message). */
export function interactionReplyBody(
  content: string,
  ephemeral = false,
): { type: number; data: { content: string; flags?: number } } {
  const data: { content: string; flags?: number } = { content };
  if (ephemeral) data.flags = 64;
  return { type: 4, data };
}

/** Edit webhook / follow-up message body. */
export function webhookMessageBody(content: string): { content: string } {
  return { content };
}
