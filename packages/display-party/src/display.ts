import { Store, StoreMessage } from "state-party";
import { createPatch } from "./vdom.js";
import { View } from "./view.js";

export class Display {
  private listener: (evt: Event) => void = () => { }

  constructor(private store: Store) {
    this.listener = (evt: Event) => {
      const displayMessageEvent = evt as CustomEvent<StoreMessage<any>>
      this.store.dispatch(displayMessageEvent.detail)
    }
  }

  mount(element: Element, view: View): () => void {
    const patch = createPatch(this.store)
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