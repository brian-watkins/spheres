import { attributesModule, init, propsModule } from "snabbdom";
import { Loop } from "./state";
import { View, ViewMessage } from "./view";

export class Display {
  private appRoot: HTMLElement | undefined

  constructor(private loop: Loop, private view: View) {}

  mount(element: HTMLElement) {
    this.appRoot = element
    const mountPoint = document.createElement("div")
    this.appRoot.appendChild(mountPoint)

    this.appRoot.addEventListener("displayMessage", (evt) => {
      const displayMessageEvent = evt as CustomEvent<ViewMessage>
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