import { Loop, LoopMessage } from "../loop.js";
import { createPatch } from "./vdom.js";
import { View } from "./view.js";

export class Display {
  private appRoot: HTMLElement | undefined
  private listener: (evt: Event) => void = () => { }

  constructor(loop: Loop) {
    this.listener = (evt: Event) => {
      const displayMessageEvent = evt as CustomEvent<LoopMessage<any>>
      loop.dispatch(displayMessageEvent.detail)
    }
    document.addEventListener("displayMessage", this.listener)
  }

  mountView(element: HTMLElement, view: View) {
    this.appRoot = element
    const mountPoint = document.createElement("div")
    this.appRoot.appendChild(mountPoint)

    const patch = createPatch()
    patch(mountPoint, view)
  }

  activateIsland(island: View) {
    const name = island.data!.loop!.activationId
    const viewIslands = document.querySelectorAll(`view-fragment[data-activation-id='${name}']`)
    for (const viewIsland of viewIslands) {
      island.elm = viewIsland
      island.data!.hook!.create!(island, island)        
    }
  }

  destroy() {
    if (this.appRoot) {
      this.appRoot.childNodes.forEach(node => node.remove())
      document.removeEventListener("displayMessage", this.listener)
      this.appRoot = undefined
    }
  }
}