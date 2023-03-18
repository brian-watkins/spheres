import { attributesModule, classModule, eventListenersModule, init, propsModule } from "snabbdom";
import { Loop, LoopMessage } from "../loop.js";
import { View } from "./view.js";

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

    const patch = init([
      propsModule,
      attributesModule,
      classModule,
      eventListenersModule
    ])

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