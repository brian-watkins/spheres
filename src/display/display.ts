import { Loop, LoopMessage } from "../loop.js";
import { createPatch } from "./vdom.js";
import { View } from "./view.js";

export class Display {
  private listener: (evt: Event) => void = () => { }

  constructor(loop: Loop) {
    this.listener = (evt: Event) => {
      const displayMessageEvent = evt as CustomEvent<LoopMessage<any>>
      loop.dispatch(displayMessageEvent.detail)
    }
  }

  mount(element: Element, view: View): () => void {
    const patch = createPatch()
    const vnode = patch(element, view)
    const mountPoint = vnode.elm as HTMLElement
    mountPoint.addEventListener("displayMessage", this.listener)

    return () => {
      this.unmount(mountPoint)
    }
  }

  private unmount(element: HTMLElement) {
    element.removeEventListener("displayMessage", this.listener)
    element.remove()
  }
}