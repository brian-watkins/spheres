import { HTMLBuilder } from "spheres/view";

export function dynamic(root: HTMLBuilder) {
  root.b(el => {
    el.children.textNode("BOLD TEXT!")
  })
}