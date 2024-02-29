import { renderToDOM } from "@src/index.js"
import { DOMChangeRecord, structureChangeRecord, textChangeRecord } from "./changeRecords.js"
import { Store } from "@spheres/store"

export class TestApp {
  private unmountTestApp: (() => void) | undefined
  private observer: MutationObserver | undefined
  public changeRecords: Array<DOMChangeRecord> = []

  async startApp<T>(name: string, context?: T) {
    const store = new Store()
    this.changeRecords = []

    const viewConfiguration = await import(`../fixtures/${name}.ts`)
    const view = viewConfiguration.default

    const testAppMountPoint = document.createElement("div")
    testAppMountPoint.id = "test-display"
    document.body.appendChild(testAppMountPoint)

    // Maybe for these tests, if the context is not undefined then
    // we assume that the view export is a function that takes the context
    // and produces an HTMLViewFunction<undefined>?

    // const renderResult = renderToDOM(store, testAppMountPoint, view(context))
    const renderResult = renderToDOM(store, testAppMountPoint, view)
    this.unmountTestApp = renderResult.unmount
  }

  observe(selector: string) {
    const target: HTMLElement = document.querySelector(selector)!

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        switch (mutation.type) {
          case "characterData":
            this.changeRecords.push(textChangeRecord())
            break
          case "childList":
            this.changeRecords.push(structureChangeRecord({
              removedNodes: mutation.removedNodes.length,
              addedNodes: mutation.addedNodes.length
            }))
            break
        }
      }
    })

    this.observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }

  destroyApp() {
    this.unmountTestApp?.()
    this.observer?.disconnect()
  }
}