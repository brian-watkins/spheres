import { Context } from "esbehavior"
import { DisplayElement, TestApp, TestDisplay } from "../../helpers/testApp.js"
import { Circle } from "../../../src/circles/state.js"
import { Page } from "playwright"

export function testCirclesApp(context: Context<TestApp>): Context<TestCirclesApp> {
  return {
    init: () => new TestCirclesApp(context.init() as TestApp)
  }
}

export class TestCirclesApp {
  constructor(private testApp: TestApp) { }

  async renderAppWithCircles(circles: Array<Circle>) {
    await this.testApp.renderApp("circles")
    await this.testApp.page?.evaluate((circles) => {
      window.startCircleApp(circles)
    }, circles)
  }

  get display(): TestCirclesDisplay {
    return new TestCirclesDisplay(this.testApp.page!)
  }
}

export class TestCirclesDisplay extends TestDisplay {
  constructor(page: Page) {
    super(page)
  }

  createCircleAt(x: number, y: number): Promise<void> {
    return this.canvas.click({ x, y })
  }

  get canvas(): DisplayElement {
    return this.selectElement("[data-canvas]")
  }

  get undoButton(): DisplayElement {
    return this.selectElementWithText("Undo")
  }

  get redoButton(): DisplayElement {
    return this.selectElementWithText("Redo")
  }

  async openDialogForCircleCenteredAt(x: number, y: number): Promise<void> {
    await this.circleCenteredAt(x, y).click()
  }

  async openRadiusInputForCircleCenteredAt(x: number, y: number): Promise<void> {
    await this.selectElementWithText(`Adjust Diameter of circle at (${x}, ${y})`).click()
  }

  get radiusInput(): DisplayElement {
    return this.selectElement("input[name='radius']")
  }

  closeDialog(): Promise<void> {
    return this.page.keyboard.press("Escape")
  }

  circleCenteredAt(x: number, y: number): CircleDisplayElement {
    return new CircleDisplayElement(this.page, x, y)
  }
}

class CircleDisplayElement extends DisplayElement {
  private display: TestCirclesDisplay

  constructor(page: Page, private x: number, private y: number) {
    super(page.locator(`circle[cx='${x}'][cy='${y}']`))
    this.display = new TestCirclesDisplay(page)
  }
  
  get radius(): Promise<number> {
    return this.attribute("r").then(s => Number(s))
  }

  async adjustRadiusTo(radius: number): Promise<void> {
    await this.display.openDialogForCircleCenteredAt(this.x, this.y)
    await this.display.openRadiusInputForCircleCenteredAt(this.x, this.y)
    await this.display.radiusInput.setValue(radius.toString())
    await this.display.closeDialog()
  }
}