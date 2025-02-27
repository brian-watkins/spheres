import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from "express"
import { Server } from "http"
import { PluginOption, RunnableDevEnvironment, ViteDevServer, createServer as createViteServer } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"
import { Context } from 'esbehavior'
import { BrowserTestInstrument, useBrowser } from 'best-behavior/browser'
import { useModule } from "best-behavior/transpiler"
import { SSRParts } from './ssrApp.js'
import { TestAppDisplay } from '../../helpers/testDisplay.js'
import { spheres, SpheresPluginOptions } from '@server/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface SSRTestAppContext {
  server: TestSSRServer
  browser: TestBrowser
}

export function ssrTestAppContext(configure?: (server: TestSSRServer) => void): Context<SSRTestAppContext> {
  return useBrowser({
    init: async (browser) => {
      const server = new TestSSRServer()
      configure?.(server)

      await server.start()

      return {
        server: server,
        browser: new TestBrowser(browser)
      }
    },
    teardown: async (context) => {
      if (!context.browser.browser.isVisible) {
        await context.browser.browser.page.close()
        await context.server.close()
      }
    }
  })
}


class TestBrowser {
  constructor(public browser: BrowserTestInstrument) { }

  get display(): TestAppDisplay {
    return new TestAppDisplay(this.browser.page)
  }

  async loadApp(): Promise<void> {
    await this.browser.page.goto("http://localhost:9899/index.html")
  }
}

export interface SsrAppOptions {
  template: string
  view: string
}

export class TestSSRServer {
  private server: Server<any, any> | undefined
  private viteDevServer: ViteDevServer | undefined
  private renderer: ServerSideRenderer | undefined
  private spheresPluginOptions: SpheresPluginOptions | undefined
  renderedHTML: string = ""

  setSSRApp(options: SsrAppOptions) {
    this.renderer = new TemplateRenderer(options)
  }

  setSSRView(path: string) {
    this.renderer = new PageRenderer(path)
  }

  useSpheresPlugin(options: SpheresPluginOptions = {}) {
    this.spheresPluginOptions = options
  }

  private getVitePlugins(): Array<PluginOption> {
    const plugins: Array<PluginOption> = [
      tsConfigPaths()
    ]

    if (this.spheresPluginOptions !== undefined) {
      plugins.push(spheres(this.spheresPluginOptions))
    }

    return plugins
  }

  async renderPage(path: string): Promise<void> {
    if (this.viteDevServer === undefined) {
      await this.start()
    }

    const response = await fetch(`http://localhost:9899${path}`)

    this.renderedHTML = await response.text()
  }

  async start(): Promise<void> {
    const app = express()

    this.viteDevServer = await createViteServer({
      optimizeDeps: {
        noDiscovery: true
      },
      server: {
        port: 9898,
        middlewareMode: true,
        hmr: false
      },
      plugins: this.getVitePlugins(),
      appType: "custom"
    })

    app.use(this.viteDevServer.middlewares)

    app.get("*", async (_, res, next) => {
      try {
        const html = await this.renderer?.renderHtml(this.viteDevServer!)

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

interface ServerSideRenderer {
  renderHtml(viteDevServer: ViteDevServer): Promise<string>
}

class PageRenderer implements ServerSideRenderer {
  constructor(private path: string) { }

  async renderHtml(viteDevServer: ViteDevServer): Promise<string> {
    const devEnvironment = viteDevServer.environments.server as RunnableDevEnvironment
    const renderer = await devEnvironment.runner.import(this.path)
    return renderer.render()
  }
}

class TemplateRenderer implements ServerSideRenderer {
  constructor(private contentOptions: SsrAppOptions) { }

  async renderHtml(viteDevServer: ViteDevServer): Promise<string> {
    let template = fs.readFileSync(
      path.resolve(__dirname, this.contentOptions.template),
      'utf-8',
    )

    template = await viteDevServer.transformIndexHtml("index.html", template)

    const viewRenderer = await useModule(this.contentOptions.view)
    const ssrParts: SSRParts = viewRenderer.default()

    let html = template.replace(`<!-- SSR-APP-HTML -->`, ssrParts.html)

    if (ssrParts.serializedStore !== undefined) {
      html = html.replace(`<!-- SSR-SERIALIZED-STORE -->`, `<script type="module">${ssrParts.serializedStore}</script>`)
    }

    return html
  }
}