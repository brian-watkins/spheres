import { HTMLBuilder } from "@view/index.js"
import { view } from "./withShadowRoot.js"

export default function (root: HTMLBuilder) {
  root.div((el) => {
    el.config.id("shadow-root-island")
    el.children.subview(view)
  })
}
