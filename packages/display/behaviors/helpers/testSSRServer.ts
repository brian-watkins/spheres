import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from "express"
import { Server } from "http"
import { ViteDevServer, createServer as createViteServer } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"
import { Context } from 'esbehavior'
import { Page } from 'playwright'
import { TestAppDisplay } from './testDisplay.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface SSRTestAppContext {
  server: TestSSRServer
  browser: TestBrowser
}

export function ssrTestAppContext(page: Page, ssrServer: TestSSRServer): Context<SSRTestAppContext> {
  return {
    init: () => {
      return {
        server: ssrServer,
        browser: new TestBrowser(page)
      }
    },
  }
}

class TestBrowser {
  constructor(private page: Page) { }

  get display(): TestAppDisplay {
    return new TestAppDisplay(this.page!)
  }

  async loadApp(): Promise<void> {
    await this.page.goto("http://localhost:9899/index.html")
  }
}

export interface SsrAppOptions {
  template: string
  view: string
}

export class TestSSRServer {
  private server: Server<any, any> | undefined
  private viteDevServer: ViteDevServer | undefined
  private contentOptions: SsrAppOptions | undefined

  setContent(options: SsrAppOptions) {
    this.contentOptions = options
  }

  private get contentTemplate(): string {
    return this.contentOptions?.template ?? ""
  }

  private get contentView(): string {
    return this.contentOptions?.view ?? ""
  }

  async start(): Promise<void> {
    const app = express()

    this.viteDevServer = await createViteServer({
      server: {
        port: 9898,
        middlewareMode: true,
        hmr: false
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
          path.resolve(__dirname, this.contentTemplate),
          'utf-8',
        )

        template = await this.viteDevServer!.transformIndexHtml(url, template)

        const viewRenderer = await this.viteDevServer!.ssrLoadModule(this.contentView)
        const appHtml = viewRenderer.default()

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

  async close(): Promise<void> {
    return new Promise(resolve => {
      this.viteDevServer?.close().then(() => {
        this.server?.closeAllConnections()
        this.server?.close(() => {
          resolve()
        })  
      })
    })
  }
}