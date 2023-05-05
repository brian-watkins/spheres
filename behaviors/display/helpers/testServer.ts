import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from "express"
import { Server } from "http"
import { ViteDevServer, createServer as createViteServer } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"
import { Context } from 'esbehavior'
import { Browser, BrowserContext, Page } from 'playwright'
import { TestAppDisplay } from './testDisplay.js'
import { fixStackTrace } from './stackTrace.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface SSRTestAppContext {
  server: TestServer
  browser: TestBrowser
}

export function ssrTestAppContext(browser: Browser, debug: boolean): Context<SSRTestAppContext> {
  return {
    init: () => {
      return {
        server: new TestServer(),
        browser: new TestBrowser(browser)
      }
    },
    teardown: async (context) => {
      if (!debug) {
        await context.browser.stop()
        await context.server.stop()  
      }
    }
  }
}

class TestBrowser {
  private context: BrowserContext | undefined
  private page: Page | undefined

  constructor(private browser: Browser) { }

  async start(): Promise<void> {
    this.context = await this.browser.newContext()
    this.page = await this.context.newPage()
    this.page.on("console", (message) => console.log(fixStackTrace("http://localhost:9899", message.text())))
    this.page.on("pageerror", console.log)
  }

  get display(): TestAppDisplay {
    return new TestAppDisplay(this.page!)
  }

  async loadApp(): Promise<void> {
    await this.page?.goto("http://localhost:9899/index.html")
  }

  async stop(): Promise<void> {
    await this.context?.close()
  }
}

export interface SsrAppOptions {
  template: string
  view: string
}

class TestServer {
  private server: Server<any, any> | undefined
  private viteDevServer: ViteDevServer | undefined

  async start(options: SsrAppOptions): Promise<void> {
    const app = express()

    this.viteDevServer = await createViteServer({
      server: {
        port: 9898,
        middlewareMode: true
      },
      plugins: [
        tsConfigPaths()
      ],
      appType: "custom"
    })

    app.use(this.viteDevServer.middlewares)

    app.get("*", async (req, res, next) => {
      const url = req.originalUrl

      try {
        let template = fs.readFileSync(
          path.resolve(__dirname, options.template),
          'utf-8',
        )

        template = await this.viteDevServer!.transformIndexHtml(url, template)

        const viewRenderer = await this.viteDevServer!.ssrLoadModule(options.view)
        const appHtml = await viewRenderer.default()

        const html = template.replace(`<!-- SSR-CONTENT -->`, appHtml)

        res.status(200)
          .set({ 'Content-Type': 'text/html' })
          .end(html)
      } catch (err: any) {
        this.viteDevServer!.ssrFixStacktrace(err)
        next(err)
      }
    })

    this.server = app.listen(9899)
  }

  async stop(): Promise<void> {
    return new Promise(resolve => {
      this.viteDevServer?.close().then(() => {
        this.server?.close(() => {
          resolve()
        })  
      })
    })
  }
}