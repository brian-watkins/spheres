import { Display } from "@src/display/index.js"
import { loop } from "@src/index.js"

export class TestApp {
  private appDisplay: Display | undefined

  async startApp<T>(name: string, context?: T) {
    loop().reset()
    const viewConfiguration = await import(`../fixtures/${name}.ts`)
    const view = viewConfiguration.default(context)
    this.appDisplay = new Display(loop(), view)
    this.appDisplay.mount(document.querySelector("#test-display")!)
  }

  destroyApp() {
    if (this.appDisplay) {
      this.appDisplay.destroy()
      this.appDisplay = undefined
    }
  }
}