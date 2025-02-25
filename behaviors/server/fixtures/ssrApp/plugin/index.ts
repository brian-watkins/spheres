import { createStore } from "@store/store"
import { activateView } from "@view/index"
import { funView } from "./view"

const { someView } = await import("./someView")

export function activate() {
  activateView(createStore(), document.body, (root) => {
    root.main(el => {
      el.children
        .subview(someView)
        .subview(funView)
    })
  })
}

activate()