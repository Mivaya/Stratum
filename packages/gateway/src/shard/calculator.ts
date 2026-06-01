/** Discord recommends ~1000 guilds per shard for large bots. */
export function recommendedShardCount(guildCount: number): number {
  if (guildCount <= 0) return 1;
  return Math.max(1, Math.ceil(guildCount / 1000));
}

/** Map a guild snowflake to its shard id. */
export function guildShardId(guildId: bigint | string, totalShards: number): number {
  const id = typeof guildId === "string" ? BigInt(guildId) : guildId;
  return Number((id >> 22n) % BigInt(totalShards));
}

/** Shard ids owned by this worker in Discordeno-style concurrency groups. */
export function shardIdsForWorker(
  totalShards: number,
  workerIndex: number,
  workerCount: number,
): number[] {
  const ids: number[] = [];
  for (let i = workerIndex; i < totalShards; i += workerCount) {
    ids.push(i);
  }
  return ids;
}
