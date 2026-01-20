import { spheres, SpheresPluginOptions } from "@server/index";
import { Context, use } from "best-behavior";
import { createBuilder } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import express from "express"
import { useModule } from "best-behavior/transpiler";
import { Server } from "http"
import { browserContext, BrowserTestInstrument } from "best-behavior/browser";
import { TestAppDisplay } from "helpers/testDisplay";
import { Readable } from 'stream';

export const testableViteBuildContext: Context<TestViteBuildContext> = use(browserContext(), {
  init: (browser) => new TestViteBuildContext(browser),
  async teardown(context) {
    await context.close()
  },
})

class TestViteBuildContext {
  private html: string = ""
  private base: string | undefined
  private server: Server<any, any> | undefined
  private browserDisplay: TestAppDisplay | undefined

  constructor(private browser: BrowserTestInstrument) { }

  setBase(base: string): TestViteBuildContext {
    this.base = base
    return this
  }

  async buildWithPlugin(root: string, pluginOptions: SpheresPluginOptions): Promise<void> {
    const builder = await createBuilder({
      configFile: false,
      root: root,
      base: this.base,
      plugins: [
        tsconfigPaths(),
        spheres(pluginOptions)
      ],
      logLevel: "warn"
    })

    await builder.buildApp()
  }

  async render(generator: () => Promise<string>): Promise<void> {
    this.html = await generator()
  }

  getRenderedHTML(): string {
    return this.html
  }

  async start(distPath: string): Promise<void> {
    const serverModule = await useModule(`${distPath}/server.js`)
    
    const app = express()

    app.use("/app", express.static(distPath))

    app.get("/index.html", async (_, res) => {
      const { stream }: { stream: ReadableStream<string> } = serverModule.default()

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Transfer-Encoding', 'chunked');

      const nodeStream = Readable.fromWeb(stream as any);
      nodeStream.pipe(res);
    })

    this.server = app.listen(9899)
  }

  get display(): TestAppDisplay {
    if (this.browserDisplay === undefined) {
      this.browserDisplay = new TestAppDisplay(this.browser.page)
    }
    return this.browserDisplay
  }

  async load(path: string): Promise<void> {
    await this.browser.page.goto(path, { waitUntil: "domcontentloaded" })
    this.html = await this.browser.page.content()
  }

  async close(): Promise<void> {
    return new Promise(resolve => {
      if (this.server === undefined) {
        resolve()
        return
      }

      this.server.closeAllConnections()
      this.server.close(() => {
        resolve()
      })
    })
  }
}