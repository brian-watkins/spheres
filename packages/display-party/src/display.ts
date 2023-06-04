import { Store, StoreMessage } from "state-party";
import { View, renderToDOM } from "./view.js";

export function createDisplay(store: Store = new Store()): Display {
  return new Display(store)
}

export class Display {
  private listener: (evt: Event) => void = () => { }

  constructor(private store: Store) {
    this.listener = (evt: Event) => {
      const displayMessageEvent = evt as CustomEvent<StoreMessage<any>>
      this.store.dispatch(displayMessageEvent.detail)
    }
  }

  mount(element: Element, view: View): () => void {
    const root = renderToDOM(this.store, element, view)
    root.addEventListener("displayMessage", this.listener)

    return () => {
      this.unmount(root)
    }
  }

  private unmount(element: Element) {
    element.removeEventListener("displayMessage", this.listener)
    element.remove()
  }
}