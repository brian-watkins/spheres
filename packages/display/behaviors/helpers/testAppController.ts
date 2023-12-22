import { Context } from "esbehavior";
import { TestAppDisplay } from "./testDisplay.js";
import { BrowserTestInstrument, useBrowser } from "best-behavior/browser";

export interface DisplayBehaviorOptions {
  host: string
  debug: boolean
}

export function browserAppContext(): Context<TestAppController> {
  return {
    init: () => new TestAppController()
  }
}

export class TestAppController {
  private browser: BrowserTestInstrument | undefined

  constructor() {}

  async loadApp<T>(appName: string, context?: T) {
    this.browser = await useBrowser()

    await this.browser.page.evaluate(async (args) => {
      const { TestApp } = await import("./testApp.js")
      window.esdisplay_testApp = new TestApp()
      await window.esdisplay_testApp.startApp(args.appName, args.context)
    }, { appName, context })
  }

  get display(): TestAppDisplay {
    return new TestAppDisplay(this.browser!.page)
  }
}

