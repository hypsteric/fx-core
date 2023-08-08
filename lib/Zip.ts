type Arr = readonly unknown[];
export type Zip<A, B> = A extends Arr
  ? (B extends Arr ? [...A, ...B] : Zip<A, [B]>)
  : Zip<[A], B>;

export function zip<A, B>(a: A, b: B): Zip<A, B> {
  const as = Array.isArray(a) ? a : [a];
  const bs = Array.isArray(b) ? b : [b];
  return [...as, ...bs] as Zip<A, B>;
}
