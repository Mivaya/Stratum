export type ServiceFactory<T> = () => T;
export type ServiceToken<T> = symbol | (abstract new (...args: never[]) => T);

export class Binder {
  private readonly singletons = new Map<symbol, unknown>();
  private readonly factories = new Map<symbol, ServiceFactory<unknown>>();

  registerSingleton<T>(token: ServiceToken<T>, instance: T): void {
    this.singletons.set(token as symbol, instance);
  }

  registerFactory<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): void {
    this.factories.set(token as symbol, factory as ServiceFactory<unknown>);
  }

  resolve<T>(token: ServiceToken<T>): T {
    const key = token as symbol;

    if (this.singletons.has(key)) {
      return this.singletons.get(key) as T;
    }

    const factory = this.factories.get(key);
    if (factory) {
      const instance = factory() as T;
      this.singletons.set(key, instance);
      return instance;
    }

    throw new Error(`No binding found for token: ${String(token)}`);
  }

  tryResolve<T>(token: ServiceToken<T>): T | undefined {
    try {
      return this.resolve(token);
    } catch {
      return undefined;
    }
  }

  clear(): void {
    this.singletons.clear();
    this.factories.clear();
  }
}
