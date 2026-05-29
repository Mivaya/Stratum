// Client
export { StratumClient } from "./client/StratumClient.js";
export { createStratumBot } from "./client/createStratumBot.js";
export type { StratumClientOptions, CreateStratumBotOptions, StratumRegistries } from "./client/types.js";

// Bridge
export type { Bridge, BridgeOptions, Tier, BridgeEventHandler } from "./bridge/types.js";
export { MockBridge } from "./bridge/MockBridge.js";

// Pieces
export { Unit, type UnitOptions } from "./pieces/Unit.js";
export { Registry, type UnitConstructor } from "./pieces/Registry.js";

// Registries (unit types)
export { Directive, type DirectiveOptions } from "./registries/Directive.js";
export { Hook, type HookOptions } from "./registries/Hook.js";
export { Scout, type ScoutOptions } from "./registries/Scout.js";
export { Barrier, type BarrierOptions, type BarrierResult } from "./registries/Barrier.js";
export {
  Gate,
  defineGate,
  gateAnd,
  gateOr,
  type GateLike,
  type GateOptions,
  type GateResult,
  type GateDeniedError,
} from "./registries/Gate.js";
export { Conduit, type ConduitOptions } from "./registries/Conduit.js";
export { Epilogue, type EpilogueOptions, type EpilogueRunOn } from "./registries/Epilogue.js";

// Pipeline
export { ExecutionPipeline, type PipelineRunOptions } from "./pipeline/ExecutionPipeline.js";

// Context
export type {
  DirectiveContext,
  DirectiveKind,
  ScoutContext,
  ScoutTrigger,
  EpilogueContext,
} from "./context/types.js";

// Outcome
export {
  ok,
  err,
  isOk,
  isErr,
  StratumError,
  type Outcome,
  type Ok,
  type Err,
} from "./outcome/Outcome.js";

// DI
export { Binder, type ServiceToken, type ServiceFactory } from "./binder/Binder.js";
