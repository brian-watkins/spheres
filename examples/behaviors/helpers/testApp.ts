import { Context } from "esbehavior";
import { Browser, Locator, Page } from "playwright";

export function testApp(host: string, browser: Browser): Context<TestApp> {
  return {
    init: () => new TestApp(host, browser)
  }
}

export class TestApp {
  private page: Page | undefined

  constructor(private host: string, private browser: Browser) { }

  async renderApp(name: string): Promise<void> {
    this.page = await this.getPage()
    await this.page.goto(`${this.host}/examples/behaviors/${name}/index.html`)
  }

  private async getPage(): Promise<Page> {
    const page = await this.browser.newPage()
    page.on("console", (message) => {
      const text = message.text()
      if (text.startsWith("[vite]")) return
      console.log(text.replace(this.host, ''))
    })
    page.on("pageerror", console.log)
    return page
  }

  get display(): TestDisplay {
    return new TestDisplay(this.page!)
  }
}

class TestDisplay {
  constructor(private page: Page) { }

  selectElement(selector: string): DisplayElement {
    return new DisplayElement(this.page.locator(selector))
  }
}

export class DisplayElement {
  constructor(private locator: Locator) { }

  async click(): Promise<void> {
    await this.locator.first().click({ timeout: 200 })
  }

  async text(): Promise<string> {
    return this.locator.first().innerText({ timeout: 200 })
  }

  async classNames(): Promise<string> {
    const value = await this.locator.first().getAttribute("class", { timeout: 200 })
    return value ?? ""
  }

  async inputValue(): Promise<string> {
    return this.locator.first().inputValue({ timeout: 200 })
  }

  async type(text: string): Promise<void> {
    await this.locator.first().fill(text, { timeout: 200 })
  }
}
