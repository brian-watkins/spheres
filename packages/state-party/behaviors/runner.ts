import { createServer } from "vite"
import { chromium } from "playwright"
import tsConfigPaths from "vite-tsconfig-paths"

const serverPort = 5957

const server = await createServer({
  server: {
    port: serverPort
  },
  plugins: [
    tsConfigPaths({
      root: "./behaviors"
    })
  ]
})

await server.listen()

const browser = await chromium.launch({
  headless: true
})

const page = await browser.newPage()
page.on("console", (message) => console.log(fixStackTrace(message.text())))
page.on("pageerror", console.log)

await page.goto(`http://localhost:${serverPort}/behaviors/index.html`)

const summary = await page.evaluate(() => window.validateBehaviors())

if (summary.invalid > 0 || summary.skipped > 0) {
  process.exitCode = 1
}

await browser.close()
await server.close()

// -------

function fixStackTrace(line: string): string {
  return line.replace(`http://localhost:${serverPort}`, '')
}