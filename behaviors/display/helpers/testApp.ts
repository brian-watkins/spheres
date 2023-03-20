import { Display } from "@src/display/index.js"
import { loop } from "@src/index.js"
import { DOMChangeRecord, structureChangeRecord, textChangeRecord } from "./changeRecords"

export class TestApp {
  private appDisplay: Display | undefined
  private observer: MutationObserver | undefined
  public changeRecords: Array<DOMChangeRecord> = []

  async startApp<T>(name: string, context?: T) {
    loop().reset()
    this.changeRecords = []

    const viewConfiguration = await import(`../fixtures/${name}.ts`)
    const view = viewConfiguration.default(context)
    this.appDisplay = new Display(loop(), view)
    
    const testAppMountPoint: HTMLElement = document.querySelector("#test-display")!
    this.appDisplay.mount(testAppMountPoint)  
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
    if (this.appDisplay) {
      this.appDisplay.destroy()
      this.appDisplay = undefined
      this.observer?.disconnect()
    }
  }
}