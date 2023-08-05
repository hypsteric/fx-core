/**
 *
 */
export abstract class FX<A> {
  /**
   *
   * @param fx
   * @returns
   */
  static run<A>(fx: FX<A>): A {
    if (fx instanceof Sync) {
      return fx.fn()
    }
    throw new Error('unknown FX type: ', fx)
  }
  /**
   *
   * @param fn
   * @returns
   */
  static succeed<A>(fn: () => A): FX<A> {
    return new Sync(fn)
  }
}

class Sync<A> extends FX<A> {
  constructor(readonly fn: () => A) {
    super()
  }
}
