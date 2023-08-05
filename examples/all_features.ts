import { FX } from '/mod.ts'

let N = 0
function printResult<A>(name: string, fx: FX<A>) {
  console.log(`${++N}. ${name} \n =>`, FX.run(fx), '\n')
}

printResult('helloWorld', FX.succeed('Hello World!'))

const randNumber = (max: number) => () => Math.floor(Math.random() * max)
printResult('generator', FX.succeed(randNumber(100)))

printResult(
  'mapped',
  FX.succeed('Hello World!').map(msg => msg.length)
)

const generator = FX.succeed(randNumber(100))
printResult('zipped', generator.zip(generator))
printResult('zippedLeft', generator.zipLeft(generator))
printResult('zippedRight', generator.zipRight(generator))
