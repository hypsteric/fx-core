import { Zip, zip } from '/src/helpers/zip.ts'

export type MapFX<In, Out> = (input: In) => FX<Out>

export type MapFn<In, Out> = (input: In) => Out

export abstract class FX<A> {
  static run<A>(fx: FX<A>): A {
    const stack: ((a: unknown) => FX<unknown>)[] = []
    let current: FX<unknown> = fx
    let result: A = null as A
    let loop = true

    while (loop) {
      if (current instanceof Sync) {
        const value = current.fn()
        if (stack.length <= 0) {
          result = value
          loop = false
        } else {
          const next = stack.pop()!
          current = next(value)
        }
      } else if (current instanceof FlatMap) {
        stack.push(current.nextFn)
        current = current.first
      }
    }

    return result
  }

  static succeed<A>(fn: () => A): FX<A>
  static succeed<A>(a: A): FX<A>
  static succeed<A, FnA extends () => A>(x: A | FnA): FX<A> {
    return new Sync(typeof x === 'function' ? (x as FnA) : () => x)
  }

  flatMap<B>(fn: (a: A) => FX<B>): FX<B> {
    return new FlatMap(this, fn)
  }

  map<B>(fn: (a: A) => B): FX<B> {
    return this.flatMap(a => FX.succeed(fn(a)))
  }

  zipWith<B, C>(that: FX<B>, fn: (a: A, b: B) => C): FX<C> {
    return this.flatMap(a => that.map(b => fn(a, b)))
  }

  zip<B>(that: FX<B>): FX<Zip<A, B>> {
    return this.zipWith(that, (a, b) => zip(a, b))
  }

  zipLeft<B>(that: FX<B>): FX<A> {
    return this.zipWith(that, (a, _) => a)
  }

  zipRight<B>(that: FX<B>): FX<B> {
    return this.zipWith(that, (_, b) => b)
  }
}

class Sync<A> extends FX<A> {
  constructor(readonly fn: () => A) {
    super()
  }
}

class FlatMap<A, B> extends FX<B> {
  constructor(readonly first: FX<A>, readonly nextFn: MapFX<A, B>) {
    super()
  }
}
