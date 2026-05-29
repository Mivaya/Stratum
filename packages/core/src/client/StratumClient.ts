import { EventEmitter } from "node:events";
import type { Bridge, Tier } from "../bridge/types.js";
import { Binder } from "../binder/Binder.js";
import { Registry } from "../pieces/Registry.js";
import { Directive } from "../registries/Directive.js";
import { Hook } from "../registries/Hook.js";
import { Scout } from "../registries/Scout.js";
import { Barrier } from "../registries/Barrier.js";
import { Gate } from "../registries/Gate.js";
import { Conduit } from "../registries/Conduit.js";
import { Epilogue } from "../registries/Epilogue.js";
import { ExecutionPipeline } from "../pipeline/ExecutionPipeline.js";
import type { DirectiveContext } from "../context/types.js";
import type { StratumClientEvents, StratumClientOptions, StratumRegistries } from "./types.js";
import type { Outcome } from "../outcome/Outcome.js";

export class StratumClient extends EventEmitter {
  readonly tier: Tier;
  readonly binder = new Binder();
  readonly pipeline: ExecutionPipeline;
  readonly registries: StratumRegistries;

  bridge: Bridge | null = null;
  prefix: string;
  botUserId: string | null = null;
  private started = false;

  constructor(options: StratumClientOptions = {}) {
    super();
    this.tier = options.tier ?? "monolith";
    this.prefix = options.prefix ?? "!";
    this.bridge = options.bridge ?? null;
    this.pipeline = new ExecutionPipeline(this);

    this.registries = {
      directives: new Registry<Directive>(this, "directives"),
      hooks: new Registry<Hook>(this, "hooks"),
      scouts: new Registry<Scout>(this, "scouts"),
      barriers: new Registry<Barrier>(this, "barriers"),
      gates: new Registry<Gate>(this, "gates"),
      conduits: new Registry<Conduit>(this, "conduits"),
      epilogues: new Registry<Epilogue>(this, "epilogues"),
    };
  }

  get isReady(): boolean {
    return this.started;
  }

  setBridge(bridge: Bridge): void {
    this.bridge = bridge;
    this.bindHooks();
  }

  register(directive: Directive): Directive {
    return this.registries.directives.register(directive);
  }

  getDirective(name: string): Directive | undefined {
    return this.registries.directives.get(name);
  }

  async invoke(
    directiveName: string,
    ctx: DirectiveContext,
  ): Promise<Outcome<unknown, unknown>> {
    const directive = this.getDirective(directiveName);
    if (!directive) {
      return { ok: false, error: new Error(`Unknown directive: ${directiveName}`) };
    }
    if (!directive.supports(ctx.kind)) {
      return { ok: false, error: new Error(`Directive "${directiveName}" does not support kind "${ctx.kind}"`) };
    }
    return this.pipeline.runDirective(directive, ctx);
  }

  async start(): Promise<void> {
    if (!this.bridge) {
      throw new Error("No bridge configured. Pass bridge in options or call setBridge() before start().");
    }
    await this.bridge.connect();
    this.bindHooks();
    this.started = true;
    this.emit("ready");
  }

  async stop(): Promise<void> {
    if (this.bridge) {
      await this.bridge.disconnect();
    }
    this.started = false;
  }

  private bindHooks(): void {
    if (!this.bridge) return;

    for (const hook of this.registries.hooks.values()) {
      const handler = async (payload: unknown) => {
        try {
          await hook.handle(payload);
        } catch (error) {
          this.emit("hookError", { hook: hook.name, error });
        }
      };

      if (hook.once) {
        this.bridge.once(hook.event, handler);
      } else {
        this.bridge.on(hook.event, handler);
      }
    }
  }

  override emit<K extends keyof StratumClientEvents>(
    event: K,
    ...args: StratumClientEvents[K]
  ): boolean {
    return super.emit(event, ...args);
  }

  override on<K extends keyof StratumClientEvents>(
    event: K,
    listener: (...args: StratumClientEvents[K]) => void,
  ): this {
    return super.on(event, listener);
  }
}
