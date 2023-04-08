import { createServer } from "vite"
import { chromium } from "playwright"
import tsConfigPaths from "vite-tsconfig-paths"
import { validateBehaviors } from "./index.js"

const serverPort = 5957
const serverHost = `http://localhost:${serverPort}`

const server = await createServer({
  server: {
    port: serverPort
  },
  plugins: [
    tsConfigPaths()
  ]
})

await server.listen()

const browser = await chromium.launch({
  headless: !isDebug()
})

const summary = await validateBehaviors(browser, serverHost, { debug: isDebug() })

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