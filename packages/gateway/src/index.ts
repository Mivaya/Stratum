export {
  recommendedShardCount,
  guildShardId,
  shardIdsForWorker,
  guildsPerShardAverage,
  shardCapacityRatio,
  guildShardChanged,
  guildsAffectedByReshard,
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

export {
  GatewayEventHub,
  createGatewayEventHub,
  type GatewayEventHubReadyPayload,
} from "./GatewayEventHub.js";

export {
  attachStambhaClient,
  type AttachStambhaClientOptions,
} from "./attachStambhaClient.js";

export {
  evaluateReshard,
  type ReshardPolicyOptions,
  type ReshardEvaluation,
  type ReshardReason,
} from "./reshard/policy.js";

export {
  createReshardPlan,
  type ReshardPlan,
  type CreateReshardPlanOptions,
} from "./reshard/plan.js";

export {
  IdentifyBudget,
  createIdentifyBudget,
  type IdentifyBudgetOptions,
} from "./reshard/IdentifyBudget.js";

export {
  ReshardController,
  createReshardController,
  type ReshardControllerOptions,
  type ReshardPhase,
} from "./reshard/ReshardController.js";

export {
  createReshardServer,
  type ReshardServerOptions,
  type ReshardServerHandle,
} from "./reshard/createReshardServer.js";
