import { FiberId } from "/lib/FiberId.ts";
import { FX } from "/lib/FX.ts";

export interface Fiber<A> {
  readonly id: FiberId;
  join(): FX<A>;
}
