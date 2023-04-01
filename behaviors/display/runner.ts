import { createServer } from "vite"
import { chromium } from "playwright"
import tsConfigPaths from "vite-tsconfig-paths"
import { validateBehaviors } from "./index.js"

const serverPort = 5957

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

const page = await browser.newPage()
page.on("console", (message) => console.log(fixStackTrace(message.text())))
page.on("pageerror", console.log)

await page.goto(`http://localhost:${serverPort}/behaviors/display/index.html`)

const summary = await validateBehaviors(page, { debug: isDebug() })

if (summary.invalid > 0 || summary.skipped > 0) {
  process.exitCode = 1
}

if (!isDebug()) {
  await browser.close()
  await server.close()  
}

// -------

function fixStackTrace(line: string): string {
  return line.replace(`http://localhost:${serverPort}`, '')
}

function isDebug(): boolean {
  return process.env["DEBUG"] !== undefined
}