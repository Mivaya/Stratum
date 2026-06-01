export {
  recommendedShardCount,
  guildShardId,
  shardIdsForWorker,
} from "./shard/calculator.js";

export {
  ShardManager,
  createShardManager,
  type ShardManagerOptions,
  type ShardRecord,
  type ShardSession,
  type ShardStatus,
} from "./shard/ShardManager.js";

export {
  buildIdentifyPayload,
  buildResumePayload,
  combineIntents,
  GatewayIntent,
  type GatewayIdentifyPayload,
  type GatewayResumePayload,
  type BuildIdentifyOptions,
} from "./shard/identify.js";

export type { WorkerMessage, WorkerMessageHandler, WorkerBus } from "./worker/types.js";
export { WorkerMessageTypes, createWorkerMessage } from "./worker/types.js";
export { InMemoryWorkerBus } from "./worker/InMemoryWorkerBus.js";
export {
  HttpWorkerClient,
  createHttpWorkerClient,
  createWorkerServer,
  type HttpWorkerClientOptions,
  type WorkerServerOptions,
  type WorkerServerHandle,
} from "./worker/HttpWorkerBus.js";
export {
  attachGatewayRelay,
  type GatewayRelayOptions,
  type WorkerPublisher,
} from "./worker/gatewayRelay.js";
