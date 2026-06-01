import { EventEmitter } from "node:events";
import type { Bridge, Tier, WorkerRole } from "../bridge/types.js";
import type { RestPort, TierBus } from "../tier/types.js";
import { Binder } from "../binder/Binder.js";
import { DefaultStratumContainer } from "../container/DefaultStratumContainer.js";
import type { StratumContainerLike } from "../container/types.js";
import type { PluginLifecycle } from "../plugins/types.js";
import { Registry } from "../pieces/Registry.js";
import { Command } from "../registries/Command.js";
import { Hook } from "../registries/Hook.js";
import { Scout } from "../registries/Scout.js";
import { Barrier } from "../registries/Barrier.js";
import { Gate } from "../registries/Gate.js";
import { Conduit } from "../registries/Conduit.js";
import { Epilogue } from "../registries/Epilogue.js";
import { Signal } from "../registries/Signal.js";
import { Chron } from "../registries/Chron.js";
import { ChronScheduler } from "../chron/ChronScheduler.js";
import { ExecutionPipeline } from "../pipeline/ExecutionPipeline.js";
import { InboundRouter } from "./InboundRouter.js";
import { SignalRouter } from "./SignalRouter.js";
import { SequenceStore } from "../sequence/SequenceStore.js";
import { CommandIndex } from "../command/CommandIndex.js";
import type { CommandContext } from "../context/types.js";
import type { StratumClientEvents, StratumClientOptions, StratumRegistries } from "./types.js";
import type { Outcome } from "../outcome/Outcome.js";

export class StratumClient extends EventEmitter {
  readonly tier: Tier;
  readonly workerRole: WorkerRole;
  readonly restPort: RestPort | null;
  readonly tierBus: TierBus | null;
  readonly binder: Binder;
  readonly container: StratumContainerLike;
  readonly pipeline: ExecutionPipeline;
  readonly router: InboundRouter;
  readonly signalRouter: SignalRouter;
  readonly sequences: SequenceStore;
  readonly chronScheduler: ChronScheduler;
  readonly commandIndex: CommandIndex;
  readonly registries: StratumRegistries;

  bridge: Bridge | null = null;
  prefix: string;
  botUserId: string | null = null;
  /** Set via {@link createPluginManager} from `@stratum/plugins`. */
  pluginLifecycle: PluginLifecycle | null = null;
  private started = false;
  private hooksBound = false;

  constructor(options: StratumClientOptions = {}) {
    super();
    this.tier = options.tier ?? "monolith";
    this.workerRole =
      options.workerRole ?? (this.tier === "split" ? "gateway" : "monolith");
    this.restPort = options.restPort ?? null;
    this.tierBus = options.tierBus ?? null;
    this.prefix = options.prefix ?? "!";
    this.bridge = options.bridge ?? null;
    this.container = options.container ?? new DefaultStratumContainer();
    this.binder = this.container.binder;
    this.pipeline = new ExecutionPipeline(this);
    this.router = new InboundRouter(this);
    this.signalRouter = new SignalRouter(this);
    this.sequences = new SequenceStore();
    this.chronScheduler = new ChronScheduler();
    this.commandIndex = new CommandIndex();

    this.registries = {
      commands: new Registry<Command>(this, "commands"),
      hooks: new Registry<Hook>(this, "hooks"),
      scouts: new Registry<Scout>(this, "scouts"),
      barriers: new Registry<Barrier>(this, "barriers"),
      gates: new Registry<Gate>(this, "gates"),
      conduits: new Registry<Conduit>(this, "conduits"),
      epilogues: new Registry<Epilogue>(this, "epilogues"),
      signals: new Registry<Signal>(this, "signals"),
      chrons: new Registry<Chron>(this, "chrons"),
    };
  }

  get isReady(): boolean {
    return this.started;
  }

  setBridge(bridge: Bridge): void {
    this.bridge = bridge;
    this.hooksBound = false;
  }

  setBotUserId(userId: string): void {
    this.botUserId = userId;
  }

  register(command: Command): Command {
    const registered = this.registries.commands.register(command);
    this.rebuildCommandIndex();
    return registered;
  }

  rebuildCommandIndex(): void {
    this.commandIndex.rebuild(this.registries.commands.values());
  }

  getCommand(name: string): Command | undefined {
    return this.registries.commands.get(name);
  }

  /** @deprecated Use {@link getCommand} */
  getDirective(name: string): Command | undefined {
    return this.getCommand(name);
  }

  async invoke(commandName: string, ctx: CommandContext): Promise<Outcome<unknown, unknown>> {
    const command = this.getCommand(commandName);
    if (!command) {
      return { ok: false, error: new Error(`Unknown command: ${commandName}`) };
    }
    if (!command.supports(ctx.kind)) {
      return { ok: false, error: new Error(`Command "${commandName}" does not support kind "${ctx.kind}"`) };
    }
    return this.pipeline.runCommand(command, ctx);
  }

  async start(): Promise<void> {
    if (!this.bridge) {
      throw new Error("No bridge configured. Pass bridge in options or call setBridge() before start().");
    }
    if (this.tier === "split" && this.workerRole === "gateway" && !this.restPort) {
      throw new Error('Split-tier gateway requires a RestPort (e.g. new HttpRestPort({ baseUrl })).');
    }
    await this.pluginLifecycle?.runHook("preStart");
    await this.bridge.connect();
    this.bindHooks();
    this.startChrons();
    this.rebuildCommandIndex();
    this.started = true;
    this.emit("ready");
    await this.pluginLifecycle?.runHook("postStart");
  }

  async stop(): Promise<void> {
    this.chronScheduler.stop();
    if (this.bridge) {
      await this.bridge.disconnect();
    }
    this.started = false;
  }

  private startChrons(): void {
    this.chronScheduler.stop();
    this.chronScheduler.start(this.registries.chrons.values(), (chron, error) => {
      this.emit("chronError", { chron: chron.name, error });
    });
  }

  private bindHooks(): void {
    if (!this.bridge || this.hooksBound) return;
    this.hooksBound = true;

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
