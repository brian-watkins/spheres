import { Locator } from "playwright";

export class PlaywrightDisplayElement {
  constructor(private locator: Locator) { }

  async text(at: number): Promise<string> {
    return this.locator.nth(at).innerText({ timeout: 200 })
  }

  async attribute(at: number, name: string): Promise<string | undefined> {
    const value = await this.locator.nth(at).getAttribute(name, { timeout: 200 })
    return value === null ? undefined : value
  }

  async inputValue(at: number): Promise<string> {
    return this.locator.nth(at).inputValue({ timeout: 200 })
  }

  async type(at: number, text: string): Promise<void> {
    return this.locator.nth(at).type(text, { timeout: 200 })
  }

  async exists(_: number): Promise<boolean> {
    const count = await this.locator.count()
    return count > 0
  }

  async click(at: number): Promise<void> {
    await this.locator.nth(at).click({ timeout: 200 })
  }
}