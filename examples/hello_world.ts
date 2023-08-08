import { FX } from "/mod.ts";

const program = FX.succeed(() => "Hello, World!");

const result = FX.runSync(program);

console.log(`Program Result: `, result);
