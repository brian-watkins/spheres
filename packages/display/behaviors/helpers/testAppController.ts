import { Context } from "esbehavior";
import { Page } from "playwright";
import { fixStackTraceForPage } from "./stackTrace.js";
import { TestAppDisplay } from "./testDisplay.js";

export interface DisplayBehaviorOptions {
  host: string
  debug: boolean
}

export function testAppContext(page: Page, options: DisplayBehaviorOptions): Context<TestAppController> {
  return {
    init: async () => {
      const testPageUrl = `${options.host}/packages/display/behaviors/index.html`
      if (page.url() !== testPageUrl) {
        await page.goto(testPageUrl)
      } else if (options.debug) {
        await page.reload()
      }

      return new TestAppController(page)
    },
    teardown: async (controller) => {
      if (options.debug) {
        return
      }

      await controller.destroyApp()
    }
  }
}

export class TestAppController {
  constructor(private page: Page) {}

  async loadApp<T>(appName: string, context?: T) {
    try {
      await this.page.evaluate(({ appName, context }) => {
        return window.esdisplay_testApp.startApp(appName, context)
      }, { appName, context })  
    } catch (err: any) {
      throw new Error(`Error loading ${appName}\n\n${fixStackTraceForPage(this.page, err.message)}`)
    }
  }

  async destroyApp() {
    await this.page.evaluate(() => window.esdisplay_testApp.destroyApp())
  }

  get display(): TestAppDisplay {
    return new TestAppDisplay(this.page)
  }
}

