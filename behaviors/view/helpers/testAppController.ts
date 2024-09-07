import { Context } from "esbehavior";
import { TestAppDisplay } from "./testDisplay.js";
import { BrowserTestInstrument, useBrowser } from "best-behavior/browser";

export interface DisplayBehaviorOptions {
  host: string
  debug: boolean
}

export function browserAppContext(): Context<TestAppController> {
  return useBrowser({
    init: (browser) => new TestAppController(browser)
  })
}

export class TestAppController {
  constructor(private browser: BrowserTestInstrument) { }

  async loadApp(appName: string) {
    await this.browser.page.evaluate(async (args) => {
      const { TestApp } = await import("./testApp.js")
      window.esdisplay_testApp = new TestApp()
      await window.esdisplay_testApp.startApp(args.appName)
    }, { appName })
  }

  get display(): TestAppDisplay {
    return new TestAppDisplay(this.browser!.page)
  }
}

