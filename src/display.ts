import { attributesModule, init, propsModule } from "snabbdom";
import { View } from "./view";

export class Display {
  private appRoot: HTMLElement | undefined

  constructor(private view: View) {}

  mount(element: HTMLElement) {
    this.appRoot = element
    const mountPoint = document.createElement("div")
    this.appRoot.appendChild(mountPoint)

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