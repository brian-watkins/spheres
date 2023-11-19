import { Context } from "esbehavior";
import { DisplayElement, KeyboardKey, TestApp, TestDisplay } from "../../../helpers/testApp.js";
import { Locator, Page } from "playwright";

export function testCellsApp(context: Context<TestApp>): Context<TestCellsApp> {
  return {
    init: () => new TestCellsApp(context.init() as TestApp)
  }
}

export class TestCellsApp {
  constructor(private testApp: TestApp) { }

  async renderApp(): Promise<void> {
    await this.testApp.renderApp("cells/display")
  }

  get display(): TestCellsDisplay {
    return new TestCellsDisplay(this.testApp.page!)
  }
}

export class TestCellsDisplay extends TestDisplay {
  constructor(page: Page) {
    super(page)
  }

  cell(identifier: string): CellDisplayElement {
    return new CellDisplayElement(this.page.locator(`[data-cell='${identifier}']`))
  }
}

export class CellDisplayElement extends DisplayElement {
  constructor(locator: Locator) {
    super(locator)
  }

  get input(): DisplayElement {
    return this.descendant("input")
  }

  async setDefinition(definition: string): Promise<void> {
    await this.click()
    await this.input.type(definition)
    await this.input.press(KeyboardKey.Enter)
  }
}