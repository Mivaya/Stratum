import type { Bridge, Tier } from "../bridge/types.js";
import type { Binder } from "../binder/Binder.js";

export interface StratumClientOptions {
  /** Deployment tier. */
  tier?: Tier;
  /** Transport bridge (discord.js, Discordeno, mock). */
  bridge?: Bridge;
  /** Default directive prefix for message-based invocation. */
  prefix?: string;
}

export interface CreateStratumBotOptions extends StratumClientOptions {
  /** Auto-connect bridge on start. */
  autostart?: boolean;
}

export interface StratumRegistries {
  directives: import("../pieces/Registry.js").Registry<import("../registries/Directive.js").Directive>;
  hooks: import("../pieces/Registry.js").Registry<import("../registries/Hook.js").Hook>;
  scouts: import("../pieces/Registry.js").Registry<import("../registries/Scout.js").Scout>;
  barriers: import("../pieces/Registry.js").Registry<import("../registries/Barrier.js").Barrier>;
  gates: import("../pieces/Registry.js").Registry<import("../registries/Gate.js").Gate>;
  conduits: import("../pieces/Registry.js").Registry<import("../registries/Conduit.js").Conduit>;
  epilogues: import("../pieces/Registry.js").Registry<import("../registries/Epilogue.js").Epilogue>;
}

export type StratumClientEvents = {
  ready: [];
  unitRegistered: [{ registry: string; unit: import("../pieces/Unit.js").Unit }];
  unitUnregistered: [{ registry: string; name: string }];
  scoutError: [{ scout: string; error: unknown; ctx: import("../context/types.js").ScoutContext }];
  directiveBlocked: [
    {
      ctx: import("../context/types.js").DirectiveContext;
      reason?: string;
      silent?: boolean;
    },
  ];
  directiveDenied: [
    {
      ctx: import("../context/types.js").DirectiveContext;
      error: { message: string; silent: boolean; gate: string };
    },
  ];
  directiveSuccess: [
    {
      ctx: import("../context/types.js").DirectiveContext;
      directive: string;
      durationMs: number;
    },
  ];
  directiveError: [
    {
      ctx: import("../context/types.js").DirectiveContext;
      directive: string;
      error: unknown;
    },
  ];
  epilogueError: [{ epilogue: string; error: unknown; ctx: import("../context/types.js").EpilogueContext }];
  hookError: [{ hook: string; error: unknown }];
};

export type { Binder };
