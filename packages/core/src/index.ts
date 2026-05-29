// Client
export { StratumClient } from "./client/StratumClient.js";
export { createStratumBot } from "./client/createStratumBot.js";
export { InboundRouter } from "./client/InboundRouter.js";
export { SignalRouter } from "./client/SignalRouter.js";
export type { StratumClientOptions, CreateStratumBotOptions, StratumRegistries } from "./client/types.js";

// Bridge
export type { Bridge, BridgeOptions, Tier, BridgeEventHandler } from "./bridge/types.js";
export { MockBridge } from "./bridge/MockBridge.js";

// Pieces
export { Unit, type UnitOptions } from "./pieces/Unit.js";
export { Registry, type UnitConstructor } from "./pieces/Registry.js";

// Piece paths (Sapphire / Klasa layout)
export { PiecePaths, type PiecePathKey } from "./constants/piecePaths.js";

// Registries (unit types)
export { Command, type CommandOptions } from "./registries/Command.js";
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
export { Signal, type SignalOptions, type SignalType } from "./registries/Signal.js";
export type { SignalContext } from "./context/SignalContext.js";

// Pipeline
export { ExecutionPipeline, type PipelineRunOptions } from "./pipeline/ExecutionPipeline.js";

// Context
export type {
  CommandContext,
  CommandKind,
  ScoutContext,
  ScoutTrigger,
  EpilogueContext,
  DirectiveContext,
  DirectiveKind,
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

// Deprecated aliases
export { Command as Directive, type CommandOptions as DirectiveOptions } from "./registries/Command.js";
