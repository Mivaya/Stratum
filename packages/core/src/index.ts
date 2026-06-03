// Client
export { StambhaClient } from "./client/StambhaClient.js";
export { createStambhaBot } from "./client/createStambhaBot.js";
export { InboundRouter } from "./client/InboundRouter.js";
export { SignalRouter } from "./client/SignalRouter.js";
export { SequenceStore } from "./sequence/SequenceStore.js";
export { SequenceBuilder, sequence } from "./sequence/SequenceBuilder.js";
export {
  sequenceCustomId,
  parseSequenceCustomId,
  isSequenceCustomId,
} from "./sequence/customId.js";
export type {
  SequenceStep,
  SequenceStepType,
  SequenceButtonStep,
  SequenceSelectStep,
  SequenceModalStep,
  SequenceAnswers,
  SequenceResult,
  SequenceSession,
} from "./sequence/types.js";
export type { StambhaClientOptions, CreateStambhaBotOptions, StambhaRegistries } from "./client/types.js";
export type { StambhaLogger, StambhaContainerLike } from "./container/types.js";
export { ConsoleLogger } from "./container/ConsoleLogger.js";
export { DefaultStambhaContainer } from "./container/DefaultStambhaContainer.js";
export type { PluginHookName, PluginLifecycle } from "./plugins/types.js";
export type {
  DesiredProperties,
  DesiredContextFields,
  DesiredMetaFields,
  ResolvedDesiredProperties,
} from "./desired/DesiredProperties.js";
export {
  defaultDesiredProperties,
  minimalDesiredProperties,
  gatesDesiredProperties,
  resolveDesiredProperties,
} from "./desired/DesiredProperties.js";
export { slimCommandContext, slimMeta } from "./desired/slimContext.js";

// Bridge
export type { Bridge, BridgeOptions, Tier, BridgeEventHandler } from "./bridge/types.js";
export type {
  WorkerRole,
  RestMethod,
  RestRequest,
  RestResponse,
  RestErrorResponse,
  RestResult,
  RestPort,
  TierEvent,
  TierBus,
} from "./tier/types.js";
export { InMemoryTierBus } from "./tier/InMemoryTierBus.js";
export { HttpRestPort, type HttpRestPortOptions } from "./tier/HttpRestPort.js";
export {
  createRestWorkerServer,
  type RestWorkerServerOptions,
  type RestWorkerServerHandle,
} from "./tier/createRestWorkerServer.js";
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
export { Chron, type ChronOptions, type ChronSchedule } from "./registries/Chron.js";
export { ChronScheduler, type ChronErrorHandler } from "./chron/ChronScheduler.js";
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
  ChronContext,
  DirectiveContext,
  DirectiveKind,
} from "./context/types.js";
export type { ChannelType, CommandContextMeta } from "./context/meta.js";
export { isGuildChannelType } from "./context/meta.js";
export type { SlashOption, ParsedSlashOptionType, ArgsText } from "./context/args.js";
export type { AutocompleteContext, AutocompleteChoice } from "./context/autocomplete.js";
export type {
  SlashOptionDefinition,
  SlashChoiceDefinition,
  SubcommandDefinition,
  SubcommandGroupDefinition,
  ApplicationCommandJSON,
  ApplicationCommandOptionJSON,
  CommandSlashPath,
} from "./command/slashTypes.js";
export { SlashOptionType } from "./command/slashTypes.js";
export { buildApplicationCommands, diffApplicationCommands } from "./command/buildSlashPayload.js";
export { CommandIndex } from "./command/CommandIndex.js";

// Outcome
export {
  ok,
  err,
  isOk,
  isErr,
  StambhaError,
  type Outcome,
  type Ok,
  type Err,
} from "./outcome/Outcome.js";

// DI
export { Binder, type ServiceToken, type ServiceFactory } from "./binder/Binder.js";

// Deprecated aliases
export { Command as Directive, type CommandOptions as DirectiveOptions } from "./registries/Command.js";
