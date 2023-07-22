import { createServer } from "vite"
import { chromium } from "playwright"
import tsConfigPaths from "vite-tsconfig-paths"
import { PlaywrightDisplayElement } from "./helpers/playwrightDisplayElement.js"

const serverPort = 5957

const server = await createServer({
  root: "../../",
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
page.on("console", (message) => {
  const text = message.text()
  if (text.startsWith("[vite]")) return
  console.log(fixStackTrace(text))
})
page.on("pageerror", console.log)

page.exposeBinding("_testDisplayElement", async ({ page }, selector: string, at: number, method: keyof PlaywrightDisplayElement) => {
  try {
    const element = new PlaywrightDisplayElement(page.locator(selector))
    const result = await element[method](at)  
    return result
  } catch (err) {
    console.log("Error running method on display element", err)
    throw err
  }
})
page.exposeBinding("_testDisplayElementsCount", ({ page }, selector: string) => {
  return page.locator(selector).count()
})
page.exposeFunction("_testDebug", () => isDebug())

await page.goto(`http://localhost:${serverPort}/packages/display-party/renderBehaviors/index.html`)

const summary = await page.evaluate(() => window.validateBehaviors())

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
