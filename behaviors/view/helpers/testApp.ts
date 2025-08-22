import { renderToDOM } from "@view/index.js"
import { createStore } from "@store/index.js"

export class TestApp {
  private unmountTestApp: (() => void) | undefined

  async startApp(name: string) {
    const store = createStore()

    const viewConfiguration = await import(`../fixtures/${name}.ts`)
    const view = viewConfiguration.default

    const testAppMountPoint = document.createElement("div")
    testAppMountPoint.id = "test-display"
    document.body.appendChild(testAppMountPoint)

    const renderResult = renderToDOM(store, testAppMountPoint, view)
    this.unmountTestApp = renderResult.unmount
  }

  destroyApp() {
    this.unmountTestApp?.()
  }
}