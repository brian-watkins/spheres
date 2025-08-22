import { Locator, Page } from "playwright"

export class TestAppDisplay {
  constructor(private page: Page) {}

  pause(): Promise<void> {
    return this.page.pause()
  }

  select(selector: string): DisplayElement {
    return new DisplayElement(this.page.locator(selector))
  }

  selectWithText(text: string): DisplayElement {
    return new DisplayElement(this.page.getByText(text))
  }

  selectAll(selector: string): DisplayElementList {
    return new DisplayElementList(this.page.locator(selector))
  }
}

export class DisplayElementList {
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

  async texts(): Promise<Array<string>> {
    return this.map(el => el.text())
  }

  async count(): Promise<number> {
    return await this.locator.count()
  }
}

export interface TypingOptions {
  clear: boolean
}

export class DisplayElement {
  constructor(private locator: Locator) {}

  async tagName(): Promise<string> {
    return this.locator.first().evaluate((el) => el.tagName)
  }

  async type(text: string, options: TypingOptions = { clear: false }): Promise<void> {
    await this.locator.first().click({ clickCount: options.clear ? 3 : 1, timeout: 200 })
    await this.locator.first().type(text, { timeout: 200 })
  }

  async click(): Promise<void> {
    await this.locator.first().click({ timeout: 200 })
  }

  async text(): Promise<string> {
    const text = await this.locator.first().textContent({ timeout: 200 })
    return text ?? ""
  }

  async selectOption(label: string): Promise<void> {
    await this.locator.first().selectOption({ label }, { timeout: 200 })
  }

  async inputValue(): Promise<string> {
    return this.locator.first().inputValue({ timeout: 200 })
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

  async isChecked(): Promise<boolean> {
    return this.locator.first().isChecked({ timeout: 200 })
  }
}