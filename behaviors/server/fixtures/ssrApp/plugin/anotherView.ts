import { HTMLBuilder } from "@view/index.js"
import { superList } from "./helperView"

export function anotherView(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .p(el => {
        el.children.textNode("Hello!")
      })
      .subview(superList)
  })
}