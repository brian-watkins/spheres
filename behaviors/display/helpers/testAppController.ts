import { Context } from "esbehavior";
import { Locator, Page } from "playwright";

export function testAppContext(page: Page): Context<TestAppController> {
  return {
    init: () => new TestAppController(page),
    teardown: (controller) => controller.destroyApp()
  }
}

export class TestAppController {
  constructor(private page: Page) {}

  async loadApp(appName: string) {
    await this.page.evaluate((scriptName) => {
      return window.esdisplay_testApp.startApp(scriptName)
    }, appName)
  }

  async destroyApp() {
    await this.page.evaluate(() => window.esdisplay_testApp.destroyApp())
  }

  get display(): TestAppDisplay {
    return new TestAppDisplay(this.page)
  }
}

class TestAppDisplay {
  constructor(private page: Page) {}

  elementMatching(selector: string): DisplayElement {
    return new DisplayElement(this.page.locator(selector))
  }
}

class DisplayElement {
  constructor(private locator: Locator) {}

  async click(): Promise<void> {
    await this.locator.first().click()
  }

  async text(): Promise<string> {
    return this.locator.first().innerText()
  }

  async exists(): Promise<boolean> {
    const count = await this.locator.count()
    return count > 0
  }
}