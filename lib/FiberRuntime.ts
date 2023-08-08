import { FX } from "/lib/FX.ts";
import { Fiber } from "/lib/Fiber.ts";
import { FiberId } from "/lib/FiberId.ts";

export class FiberRuntime<A> implements Fiber<A> {
  private stack: ((a: unknown) => FX<unknown>)[] = [];
  private exitValue?: A;
  private observers: ((a: A) => void)[] = [];

  constructor(readonly id: FiberId, readonly fx: FX<A>) {
    this.evaluate(this.fx);
  }

  join(): FX<A> {
    if (this.exitValue) {
      return FX.async(() => Promise.resolve(this.exitValue as A));
    }
    return FX.async(() => new Promise((resolve) => this.addObserver(resolve)));
  }

  addObserver(observer: (a: A) => void): void {
    if (this.exitValue) {
      return observer(this.exitValue as A);
    }
    this.observers.push(observer);
  }

  private evaluate(fx: FX<unknown>): void {
    let current = fx;
    let loop = true;

    while (loop) {
      if (current.isSync<A>()) {
        const value = current.fn();
        if (this.stack.length <= 0) {
          loop = false;
          this.exitValue = value;
          this.observers.forEach((obs) => obs(value));
        } else {
          const next = this.stack.pop()!;
          current = next(value);
        }
      } else if (current.isAsync()) {
        loop = false;
        current.fn().then((value) => this.resume(FX.succeed(value)));
      } else if (current.isOnSuccess()) {
        this.stack.push(current.successFn);
        current = current.first;
      }
    }
  }

  private resume(fx: FX<unknown>) {
    this.evaluate(fx);
  }

  unsafePoll(): A | undefined {
    return this.exitValue;
  }
}
