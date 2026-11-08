import { HTMLBuilder } from "@view/index.js"
import { message } from "./state"

export function view(root: HTMLBuilder) {
  root.main((el) => {
    el.children.p((el) => {
      el.config.dataAttribute("message")
      el.children.textNode((get) => get(message))
    })
  })
}
