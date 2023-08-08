export class FiberId {
  private static count = 0;
  private constructor(readonly id: number) {}
  static make() {
    return new FiberId(++this.count);
  }
}
