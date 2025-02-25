import { HTMLBuilder } from "@view/index";

export function dynamic(root: HTMLBuilder) {
  root.b(el => {
    el.children.textNode("BOLD TEXT!")
  })
}