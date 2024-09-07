import { Context } from "esbehavior"
import { DisplayElement, TestApp, TestDisplay, testAppContext } from "../../helpers/testApp.js"
import { Circle } from "../../../src/circles/state.js"
import { Page } from "playwright"

export const testCirclesApp: Context<TestCirclesApp> = {
  init: async () => {
    const testApp = await testAppContext.init()
    return new TestCirclesApp(testApp)
  }
}

export class TestCirclesApp {
  constructor(private testApp: TestApp) { }

  async renderAppWithCircles(circles: Array<Circle>) {
    await this.testApp.renderApp("circles")
    await this.testApp.page.evaluate((circles) => {
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

  circleCenteredAt(x: number, y: number, options: CircleOptions = {}): CircleDisplayElement {
    return new CircleDisplayElement(this.page, x, y, options)
  }
}

interface CircleOptions {
  highlighted?: boolean
}

function circleSelector(x: number, y: number, options: CircleOptions) {
  let selector = `circle[cx='${x}'][cy='${y}']`
  if (options.highlighted !== undefined) {
    selector += options.highlighted ? ":not([fill='transparent'])" : "[fill='transparent']"
  }
  return selector
}

class CircleDisplayElement extends DisplayElement {
  private display: TestCirclesDisplay

  constructor(private page: Page, private x: number, private y: number, options: CircleOptions) {
    super(page.locator(circleSelector(x, y, options)))
    this.display = new TestCirclesDisplay(this.page)
  }

  get radius(): Promise<number> {
    return this.attribute("r").then(s => Number(s))
  }

  get isHighlighted(): Promise<boolean> {
    return this.attribute("fill").then(value => value !== "transparent")
  }

  async adjustRadiusTo(radius: number): Promise<void> {
    await this.display.openDialogForCircleCenteredAt(this.x, this.y)
    await this.display.openRadiusInputForCircleCenteredAt(this.x, this.y)
    await this.display.radiusInput.setValue(radius.toString())
    await this.display.closeDialog()
  }
}