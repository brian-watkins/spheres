import { attributesModule, classModule, eventListenersModule, init, Module, propsModule, VNode } from "snabbdom";
import { Loop, LoopMessage, State } from "../loop.js";
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

const viewFragmentModule: Module = {
  create: (_: VNode, vNode: VNode) => {
    if (vNode.sel === "view-fragment") {
      const viewState: State<View> = vNode.data!.loop.state
      vNode.data = {
        loop: { unsubscribe: () => {} },
        hook: {
          create: (_, vnode) => {
            const patch = createPatch()

            let oldNode: VNode | Element = vnode.elm as Element

            vnode.data!.loop.unsubscribe = viewState.subscribe((updatedView) => {
              oldNode = patch(oldNode, updatedView)
              vnode.elm = oldNode.elm
            })
          },
          postpatch: (oldVNode, vNode) => {
            vNode.data!.loop = oldVNode.data!.loop
          },
          destroy: (vnode) => {
            vnode.data!.loop.unsubscribe()
          }
        }
      }
    }
  }
}

function createPatch() {
  return init([
    propsModule,
    attributesModule,
    classModule,
    eventListenersModule,
    viewFragmentModule
  ])
}