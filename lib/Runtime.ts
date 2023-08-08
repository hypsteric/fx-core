import { FiberId } from "/lib/FiberId.ts";
import { FiberRuntime } from "/lib/FiberRuntime.ts";
import { FX } from "/lib/FX.ts";

// deno-lint-ignore no-explicit-any
type RuntimeFlags = Map<any, any>;
// deno-lint-ignore no-explicit-any
type FiberRefs = Map<any, any>;

export abstract class Runtime {
  private static make(
    runtimeFlags: RuntimeFlags = new Map(),
    fiberRefs: FiberRefs = new Map(),
  ): Runtime {
    return new RuntimeImpl(runtimeFlags, fiberRefs);
  }
  private static get defaultRuntime(): Runtime {
    return this.make();
  }

  static runSync<A>(fx: FX<A>): A {
    return this.defaultRuntime.unsafeRunSync(fx) as A;
  }

  static runAsync<A>(fx: FX<A>): PromiseLike<A> {
    return this.defaultRuntime.unsafeRunAsync(fx) as PromiseLike<A>;
  }

  static fork<A>(fx: FX<A>): FiberRuntime<A> {
    return this.defaultRuntime.unsafeFork(fx) as FiberRuntime<A>;
  }

  abstract unsafeFork(fx: FX<unknown>): FiberRuntime<unknown>;
  protected abstract unsafeRunSync(fx: FX<unknown>): unknown;

  protected abstract unsafeRunAsync(fx: FX<unknown>): PromiseLike<unknown>;
}

class RuntimeImpl extends Runtime {
  constructor(
    readonly runtimeFlags: RuntimeFlags,
    readonly fiberRefs: FiberRefs,
  ) {
    super();
  }

  unsafeFork<A>(fx: FX<A>): FiberRuntime<A> {
    return new FiberRuntime<A>(FiberId.make(), fx);
  }

  protected unsafeRunSync<A>(fx: FX<A>): A {
    const fiber = this.unsafeFork(fx);
    const exit = fiber.unsafePoll();

    if (exit) return exit;

    throw new AsyncFiberException(fiber);
  }

  protected unsafeRunAsync<A>(fx: FX<A>): PromiseLike<A> {
    const fiber = this.unsafeFork(fx);
    const exit = fiber.unsafePoll();
    if (exit) return Promise.resolve(exit);

    return new Promise((resolve) => fiber.addObserver(resolve));
  }
}

const defaultAsyncFiberMessage =
  `Fiber cannot be be resolved synchronously, this is caused by using runSync on an effect that performs async work`;
class AsyncFiberException<A> extends Error {
  constructor(fiber: FiberRuntime<A>) {
    super(defaultAsyncFiberMessage, { cause: fiber });
    this.name = this.constructor.name;
  }
}
