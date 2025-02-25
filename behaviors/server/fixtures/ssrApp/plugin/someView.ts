import { HTMLBuilder } from "@view/index";

export function someView(root: HTMLBuilder) {
  root.h3(el => {
    el.children.textNode("My Title!")
  })
}