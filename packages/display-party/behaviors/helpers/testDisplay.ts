import { Locator, Page } from "playwright"
import { DOMChangeRecord } from "./changeRecords.js"

export class TestAppDisplay {
  constructor(private page: Page) {}

  pause(): Promise<void> {
    return this.page.pause()
  }

  observe(selector: string): Promise<void> {
    return this.page.evaluate((selector) => {
      window.esdisplay_testApp.observe(selector)
    }, selector)
  }

  changeRecords(): Promise<Array<DOMChangeRecord>> {
    return this.page.evaluate(() => {
      return window.esdisplay_testApp.changeRecords
    })
  }

  select(selector: string): DisplayElement {
    return new DisplayElement(this.page.locator(selector))
  }

  selectAll(selector: string): DisplayElementList {
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

  async classes(): Promise<Array<string>> {
    const attr = await this.locator.first().getAttribute("class", { timeout: 200 })
    return attr ? attr.split(" ") : []
  }

  async exists(): Promise<boolean> {
    const count = await this.locator.count()
    return count > 0
  }

  async attribute(name: string): Promise<string | undefined> {
    const attr = await this.locator.first().getAttribute(name)
    if (attr === null) {
      return undefined
    }
    return attr
  }

  async isDisabled(): Promise<boolean> {
    return this.locator.first().isDisabled({ timeout: 200 })
  }

  async isFocused(): Promise<boolean> {
    return this.locator.first()
      .evaluate((el => document.activeElement === el), undefined, { timeout: 200 })
  }
}