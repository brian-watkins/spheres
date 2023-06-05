import { createServer } from "vite"
import { Browser, Page, chromium } from "playwright"
import tsConfigPaths from "vite-tsconfig-paths"
import { validateBehaviors } from "./index.js"
import { TestSSRServer } from "./helpers/testSSRServer.js"
import { fixStackTrace } from "./helpers/stackTrace.js"

const serverPort = 5957
const serverHost = `http://localhost:${serverPort}`

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

const ssrServer = new TestSSRServer()
await ssrServer.start()

const browser = await chromium.launch({
  headless: !isDebug()
})

const page = await browserPage(serverHost, browser)

const summary = await validateBehaviors(page, ssrServer, { host: serverHost, debug: isDebug() })

if (summary.invalid > 0 || summary.skipped > 0) {
  process.exitCode = 1
}

if (!isDebug()) {
  await browser.close()
  await server.close()
  await ssrServer.close()
}

// -------

function isDebug(): boolean {
  return process.env["DEBUG"] !== undefined
}

async function browserPage(host: string, browser: Browser): Promise<Page> {
  const page = await browser.newPage()
  page.on("console", (message) => {
    const text = message.text()
    if (text.startsWith("[vite]")) return
    console.log(fixStackTrace(host, text))
  })
  page.on("pageerror", console.log)

  return page
}