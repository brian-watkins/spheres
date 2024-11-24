import { Context } from "best-behavior";
import { Locator, Page } from "playwright";
import { BrowserTestInstrument, useBrowser } from "best-behavior/browser"

export const testAppContext: Context<TestApp> = useBrowser({
  init: async (localBrowser) => {
    return new TestApp(localBrowser)
  },
})

export class TestApp {
  private testDisplay: TestDisplay | undefined

  constructor(private localBrowser: BrowserTestInstrument) { }

  async renderApp(name: string): Promise<void> {
    await this.localBrowser.page.goto(`./behaviors/${name}/index.html`)
  }

  get page(): Page {
    return this.localBrowser.page
  }

  get display(): TestDisplay {
    if (this.testDisplay === undefined) {
      this.testDisplay = new TestDisplay(this.page)
    }
    return this.testDisplay
  }
}

export class TestDisplay {
  constructor(protected page: Page) { }

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

  async waitUntilHidden(): Promise<void> {
    return this.locator.first().waitFor({ state: "hidden", timeout: 200 })
  }

  async exists(): Promise<boolean> {
    const matches = await this.locator.count()
    return matches > 0
  }
}
