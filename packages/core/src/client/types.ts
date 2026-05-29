import type { Bridge, Tier } from "../bridge/types.js";
import type { Binder } from "../binder/Binder.js";

export interface StratumClientOptions {
  tier?: Tier;
  bridge?: Bridge;
  prefix?: string;
}

export interface CreateStratumBotOptions extends StratumClientOptions {
  autostart?: boolean;
}

export interface StratumRegistries {
  commands: import("../pieces/Registry.js").Registry<import("../registries/Command.js").Command>;
  hooks: import("../pieces/Registry.js").Registry<import("../registries/Hook.js").Hook>;
  scouts: import("../pieces/Registry.js").Registry<import("../registries/Scout.js").Scout>;
  barriers: import("../pieces/Registry.js").Registry<import("../registries/Barrier.js").Barrier>;
  gates: import("../pieces/Registry.js").Registry<import("../registries/Gate.js").Gate>;
  conduits: import("../pieces/Registry.js").Registry<import("../registries/Conduit.js").Conduit>;
  epilogues: import("../pieces/Registry.js").Registry<import("../registries/Epilogue.js").Epilogue>;
  signals: import("../pieces/Registry.js").Registry<import("../registries/Signal.js").Signal>;
  chrons: import("../pieces/Registry.js").Registry<import("../registries/Chron.js").Chron>;
}

export type StratumClientEvents = {
  ready: [];
  unitRegistered: [{ registry: string; unit: import("../pieces/Unit.js").Unit }];
  unitUnregistered: [{ registry: string; name: string }];
  scoutError: [{ scout: string; error: unknown; ctx: import("../context/types.js").ScoutContext }];
  commandBlocked: [
    {
      ctx: import("../context/types.js").CommandContext;
      reason?: string;
      silent?: boolean;
    },
  ];
  commandDenied: [
    {
      ctx: import("../context/types.js").CommandContext;
      error: { message: string; silent: boolean; gate: string };
    },
  ];
  commandSuccess: [
    {
      ctx: import("../context/types.js").CommandContext;
      command: string;
      durationMs: number;
    },
  ];
  commandError: [
    {
      ctx: import("../context/types.js").CommandContext;
      command: string;
      error: unknown;
    },
  ];
  epilogueError: [{ epilogue: string; error: unknown; ctx: import("../context/types.js").EpilogueContext }];
  hookError: [{ hook: string; error: unknown }];
  signalError: [{ signal: string; error: unknown; ctx: import("../context/SignalContext.js").SignalContext }];
  chronError: [{ chron: string; error: unknown }];
};

export type { Binder };
