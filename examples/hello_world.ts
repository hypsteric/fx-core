import { FX } from '/mod.ts'

const program = FX.succeed(() => 'Hello, World!')

const result = FX.run(program)

console.log(`Program Result: `, result)
