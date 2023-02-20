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

  elementsMatching(selector: string): DisplayElementList {
    return new DisplayElementList(this.page.locator(selector))
  }
}

class DisplayElementList {
  constructor(private locator: Locator) {}

  async map<T>(mapper: (element: DisplayElement) => Promise<T>): Promise<Array<T>> {
    let results: Array<T> = []
    const locators = await this.locator.all()
    for (const locator of locators) {
      const result = await mapper(new DisplayElement(locator))
      results.push(result)
    }
    return results
  }
}

export interface TypingOptions {
  clear: boolean
}

class DisplayElement {
  constructor(private locator: Locator) {}

  async type(text: string, options: TypingOptions = { clear: false }): Promise<void> {
    await this.locator.first().click({ clickCount: options.clear ? 3 : 1, timeout: 200 })
    await this.locator.first().type(text, { timeout: 200 })
  }

  async click(): Promise<void> {
    await this.locator.first().click({ timeout: 200 })
  }

  async text(): Promise<string> {
    return this.locator.first().innerText({ timeout: 200 })
  }

  async exists(): Promise<boolean> {
    const count = await this.locator.count()
    return count > 0
  }
}