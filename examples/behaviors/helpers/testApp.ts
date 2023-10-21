import { Context } from "esbehavior";
import { Browser, Locator, Page } from "playwright";

export function testApp(host: string, browser: Browser): Context<TestApp> {
  return {
    init: () => new TestApp(host, browser)
  }
}

export class TestApp {
  page: Page | undefined
  private testDisplay: TestDisplay | undefined

  constructor(private host: string, private browser: Browser) { }

  async renderApp(name: string): Promise<void> {
    this.page = await this.getPage()
    this.testDisplay = new TestDisplay(this.page)
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
    return this.testDisplay!
  }
}

class TestAlert {
  constructor(public readonly message: string) { }
}

export class TestDisplay {
  public lastAlert: TestAlert | undefined

  constructor(protected page: Page) {
    page.on("dialog", async (dialog) => {
      this.lastAlert = new TestAlert(dialog.message())
      await dialog.dismiss()
    })
  }

  pause(): Promise<void> {
    return this.page.pause()
  }

  tick(millis: number): Promise<void> {
    return this.page.evaluate((millis) => { window.__testRepeater.runFor(millis) }, millis)
  }

  selectElement(selector: string): DisplayElement {
    return new DisplayElement(this.page.locator(selector))
  }

  selectElements(selector: string): DisplayElementList {
    return new DisplayElementList(this.page.locator(selector))
  }

  selectElementWithText(text: string): DisplayElement {
    return new DisplayElement(this.page.getByText(text))
  }
}

export interface MousePosition {
  x: number
  y: number
}

export interface MouseMovement {
  from: MousePosition,
  to: MousePosition
}

export class DisplayElementList {
  constructor (private locator: Locator) { }

  count(): Promise<number> {
    return this.locator.count()
  }
}

export enum KeyboardKey {
  Enter = "Enter"
}

export class DisplayElement {
  constructor(private locator: Locator) { }

  descendant(selector: string): DisplayElement {
    return new DisplayElement(this.locator.locator(selector))
  }

  async hover(position?: MousePosition): Promise<void> {
    await this.locator.first().hover({ position, timeout: 200 })
  }

  async moveMouse(movement: MouseMovement): Promise<void> {
    const box = await this.locator.boundingBox()
    await this.locator.page().mouse.move(box!.x + movement.from.x, box!.y + movement.from.y)
    await this.locator.page().mouse.move(box!.x + movement.to.x, box!.y + movement.to.y, { steps: 10 })
  }

  async click(position?: MousePosition): Promise<void> {
    await this.locator.first().click({ position, timeout: 200 })
  }

  async text(): Promise<string> {
    return this.locator.first().innerText({ timeout: 200 })
  }

  async attribute(name: string): Promise<string> {
    const attr = await this.locator.first().getAttribute(name, { timeout: 200 })
    return attr ?? ""
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

  async press(key: KeyboardKey): Promise<void> {
    await this.locator.first().press(key, { timeout: 200 })
  }

  async select(option: string): Promise<void> {
    await this.locator.first().selectOption(option, { timeout: 200 })
  }

  async setValue(value: string): Promise<void> {
    await this.locator.first().fill(value, { timeout: 200 })
  }

  async isDisabled(): Promise<boolean> {
    return this.locator.first().isDisabled({ timeout: 200 })
  }

  async isVisible(): Promise<boolean> {
    return this.locator.first().isVisible()
  }

  async exists(): Promise<boolean> {
    const matches = await this.locator.count()
    return matches > 0
  }
}
