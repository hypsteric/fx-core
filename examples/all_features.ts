import { FX } from '/mod.ts'

let N = 0
function runSync<A>(name: string, fx: FX<A>) {
  const n = ++N
  console.time(`${n}. "${name}" timing`)
  try {
    const result = FX.runSync(fx)
    console.log(`\n${n}. "${name}" result:\n   =>`, result)
  } catch (error) {
    console.error(`\n${n}. "${name}" failed with error:\n  `, error)
  }
  console.timeEnd(`${n}. "${name}" timing`)
}
async function runAsync<A>(name: string, fx: FX<A>) {
  const n = ++N
  console.time(`${n}. "${name}" timing`)
  try {
    const result = await FX.runAsync(fx)
    console.log(`\n${n}. "${name}" result:\n   =>`, result)
  } catch (error) {
    console.error(`\n${n}. "${name}" failed with error:\n  `, error)
  }
  console.timeEnd(`${n}. "${name}" timing`)
}

const randomInt = (max: number) => FX.succeed(Math.floor(Math.random() * max))

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const speakWithDelay = (msg: string, ms: number) => FX.async(wait(ms)).map(_ => msg)

runSync('helloWorld', FX.succeed('Hello World!'))
runSync('generator', randomInt(100))
runSync(
  'mapped',
  FX.succeed('Hello World!').map(msg => msg.length)
)

runSync('zipped', randomInt(100).zip(randomInt(100)))
runSync('zippedLeft', randomInt(100).zipLeft(randomInt(100)))
runSync('zippedRight', randomInt(100).zipRight(randomInt(100)))

await runAsync('Async run', speakWithDelay('Async Hello', 1000))
await runAsync('parallel', speakWithDelay('Hello', 1000).zipPar(speakWithDelay('World', 1000)))
await runAsync('parallel Left', speakWithDelay('Left', 1000).zipLeftPar(speakWithDelay('Right', 1000)))
await runAsync('parallel Right', speakWithDelay('Left', 1000).zipRightPar(speakWithDelay('Right', 1000)))
await runAsync('parallel A fastest', speakWithDelay('Fast', 500).zipPar(speakWithDelay('Slow', 1000)))
await runAsync('parallel B fastest', speakWithDelay('Slow', 1000).zipPar(speakWithDelay('Fast', 500)))
