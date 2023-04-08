import { loop } from "../index.js";
import { Loop, LoopMessage } from "../loop.js";
import { createPatch } from "./vdom.js";
import { View, island } from "./view.js";

export class Display {
  private appRoot: HTMLElement | undefined
  private listener: (evt: Event) => void = () => {}

  constructor(private loop: Loop, private view: View) {}

  mount(element: HTMLElement) {
    this.appRoot = element
    const mountPoint = document.createElement("div")
    this.appRoot.appendChild(mountPoint)

    this.listener = (evt: Event) => {
      const displayMessageEvent = evt as CustomEvent<LoopMessage<any>>
      this.loop.dispatch(displayMessageEvent.detail)
    }

    this.appRoot.addEventListener("displayMessage", this.listener)

    const patch = createPatch()

    patch(mountPoint, this.view)
  }

  destroy() {
    if (this.appRoot) {
      this.appRoot.childNodes.forEach(node => node.remove())
      this.appRoot.removeEventListener("displayMessage", this.listener)
      this.listener = () => {}
      this.appRoot = undefined
    }
  }
}

export async function activateIslands() {
  document.addEventListener("displayMessage", (evt) => {
    const displayMessageEvent = evt as CustomEvent<LoopMessage<any>>
    loop().dispatch(displayMessageEvent.detail)
  })

  const islandElements = document.querySelectorAll("view-island")

  for (const islandElement of islandElements) {
    const islandIndex = (islandElement as HTMLElement).dataset.islandId ?? ""
    const loader = window.esdisplay.islands[islandIndex]
    if (loader) {
      const virtualIsland = await island(loader)
      virtualIsland.elm = islandElement
      virtualIsland.data!.hook!.create!(virtualIsland, virtualIsland)
    }
  }
}