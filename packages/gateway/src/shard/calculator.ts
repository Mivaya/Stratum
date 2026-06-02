const DEFAULT_GUILDS_PER_SHARD = 1000;

/** Discord recommends ~1000 guilds per shard for large bots. */
export function recommendedShardCount(
  guildCount: number,
  guildsPerShard = DEFAULT_GUILDS_PER_SHARD,
): number {
  if (guildCount <= 0) return 1;
  return Math.max(1, Math.ceil(guildCount / guildsPerShard));
}

/** Average guild load per shard at the current shard count. */
export function guildsPerShardAverage(guildCount: number, totalShards: number): number {
  if (totalShards <= 0) return guildCount;
  return guildCount / totalShards;
}

/** Shard utilization ratio (0–1+) relative to the recommended guilds-per-shard cap. */
export function shardCapacityRatio(
  guildCount: number,
  totalShards: number,
  guildsPerShard = DEFAULT_GUILDS_PER_SHARD,
): number {
  return guildsPerShardAverage(guildCount, totalShards) / guildsPerShard;
}

/** Map a guild snowflake to its shard id. */
export function guildShardId(guildId: bigint | string, totalShards: number): number {
  if (totalShards <= 0) throw new Error("totalShards must be >= 1");
  const id = typeof guildId === "string" ? BigInt(guildId) : guildId;
  return Number((id >> 22n) % BigInt(totalShards));
}

/** Whether a guild moves to a different shard when total shard count changes. */
export function guildShardChanged(
  guildId: bigint | string,
  fromTotal: number,
  toTotal: number,
): boolean {
  if (fromTotal === toTotal) return false;
  return guildShardId(guildId, fromTotal) !== guildShardId(guildId, toTotal);
}

/** Guild ids whose shard assignment changes after a reshard. */
export function guildsAffectedByReshard(
  fromTotal: number,
  toTotal: number,
  guildIds: readonly string[],
): string[] {
  return guildIds.filter((id) => guildShardChanged(id, fromTotal, toTotal));
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
