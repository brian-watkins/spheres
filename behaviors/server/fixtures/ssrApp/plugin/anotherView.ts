import { HTMLBuilder } from "@view/index.js"

export function anotherView(root: HTMLBuilder) {
  root.p(el => {
    el.children.textNode("Hello!")
  })
}