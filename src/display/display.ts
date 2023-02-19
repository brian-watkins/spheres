import { attributesModule, init, propsModule } from "snabbdom";
import { Loop, LoopMessage } from "../loop";
import { View } from "./view";

export class Display {
  private appRoot: HTMLElement | undefined

  constructor(private loop: Loop, private view: View) {}

  mount(element: HTMLElement) {
    this.appRoot = element
    const mountPoint = document.createElement("div")
    this.appRoot.appendChild(mountPoint)

    this.appRoot.addEventListener("displayMessage", (evt) => {
      const displayMessageEvent = evt as CustomEvent<LoopMessage<any>>
      this.loop.dispatch(displayMessageEvent.detail)
    })

    const patch = init([
      propsModule,
      attributesModule
    ])

    patch(mountPoint, this.view)
  }

  destroy() {
    if (this.appRoot) {
      this.appRoot.childNodes.forEach(node => node.remove())
      this.appRoot = undefined
    }
  }
}