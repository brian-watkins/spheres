import { createServer } from "vite"
import { chromium } from "playwright"
import tsConfigPaths from "vite-tsconfig-paths"
import { validate } from "esbehavior"
import counterBehavior from "./counter/counter.behavior.js"
import { testApp } from "./helpers/testApp.js"
import converterBehavior from "./converter/converter.behavior.js"
import flightBookerBehavior from "./flightBooker/flightBooker.behavior.js"
import timerBehavior from "./timer/timer.behavior.js"
import crudBehavior from "./crud/crud.behavior.js"
import circlesBehavior from "./circles/circles.behavior.js"
import cellsBehavior from "./cells/display/cells.behavior.js"

const serverPort = 5957

const server = await createServer({
  root: "../",
  server: {
    port: serverPort
  },
  plugins: [
    tsConfigPaths()
  ],
  css: {
    postcss: "examples"
  }
})

await server.listen()

const browser = await chromium.launch({
  headless: !isDebug()
})

const testContext = testApp(`http://localhost:${serverPort}`, browser)

const summary = await validate([
  counterBehavior(testContext),
  converterBehavior(testContext),
  flightBookerBehavior(testContext),
  timerBehavior(testContext),
  ...crudBehavior(testContext),
  ...circlesBehavior(testContext),
  cellsBehavior(testContext)
], { failFast: true })

if (summary.invalid > 0 || summary.skipped > 0) {
  process.exitCode = 1
}

if (!isDebug()) {
  await browser.close()
  await server.close()
}

// -------

function isDebug(): boolean {
  return process.env["DEBUG"] !== undefined
}
