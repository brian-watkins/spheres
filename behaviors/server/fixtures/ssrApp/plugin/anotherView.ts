import { HTMLBuilder } from "spheres/view"
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