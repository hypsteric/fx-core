import { Runtime } from '/lib/Runtime.ts'
import { Fiber } from '/lib/Fiber.ts'
import { zip } from '/lib/Zip.ts'

export abstract class FX<A> {
  static runSync<A>(fx: FX<A>): A {
    return Runtime.runSync(fx)
  }
  static runAsync<A>(fx: FX<A>): PromiseLike<A> {
    return Runtime.runAsync(fx)
  }

  static none(): FX<void> {
    return FX.succeed(() => {})
  }

  static async<A>(fn: () => PromiseLike<A>): FX<A>
  static async<A>(a: PromiseLike<A>): FX<A>
  static async<A, FnA extends () => PromiseLike<A>>(x: PromiseLike<A> | FnA): FX<A> {
    return new Async(typeof x === 'function' ? x : () => x)
  }

  static succeed<A>(fn: () => A): FX<A>
  static succeed<A>(a: A): FX<A>
  static succeed<A, FnA extends () => A>(x: A | FnA): FX<A> {
    return new Sync(typeof x === 'function' ? (x as FnA) : () => x)
  }

  fork(): FX<Fiber<A>> {
    return FX.succeed(() => Runtime.fork(this))
  }

  flatMap<B>(fn: (a: A) => FX<B>): FX<B> {
    return new OnSuccess(this, fn)
  }

  map<B>(fn: (a: A) => B): FX<B> {
    return this.flatMap(a => FX.succeed(fn(a)))
  }

  zipWith<B, C>(that: FX<B>, fn: (a: A, b: B) => C): FX<C> {
    return this.flatMap(a => that.map(b => fn(a, b)))
  }

  zip<B>(that: FX<B>) {
    return this.zipWith(that, zip)
  }

  zipLeft<B>(that: FX<B>): FX<A> {
    return this.zipWith(that, (a, _) => a)
  }

  zipRight<B>(that: FX<B>): FX<B> {
    return this.zipWith(that, (_, b) => b)
  }

  zipWithPar<B, C>(that: FX<B>, fn: (a: A, b: B) => C): FX<C> {
    return this.fork().flatMap(fa => that.fork().flatMap(fb => fa.join().flatMap(a => fb.join().map(b => fn(a, b)))))
  }

  zipPar<B>(that: FX<B>) {
    return this.zipWithPar(that, zip)
  }

  zipLeftPar<B>(that: FX<B>): FX<A> {
    return this.zipWithPar(that, (a, _) => a)
  }

  zipRightPar<B>(that: FX<B>): FX<B> {
    return this.zipWithPar(that, (_, b) => b)
  }

  isSync<A>(): this is Sync<A> {
    return this instanceof Sync
  }
  isAsync<A>(): this is Async<A> {
    return this instanceof Async
  }
  isOnSuccess<A, B>(): this is OnSuccess<A, B> {
    return this instanceof OnSuccess
  }
}

class Sync<A> extends FX<A> {
  constructor(readonly fn: () => A) {
    super()
  }
}

class Async<A> extends FX<A> {
  constructor(readonly fn: () => PromiseLike<A>) {
    super()
  }
}

class OnSuccess<A, B> extends FX<B> {
  constructor(readonly first: FX<A>, readonly successFn: (a: A) => FX<B>) {
    super()
  }
}
