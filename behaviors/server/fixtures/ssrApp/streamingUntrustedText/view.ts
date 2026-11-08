import { HTMLBuilder } from "@view/index"
import { message } from "./state"

export default function view(root: HTMLBuilder) {
  root.main((el) => {
    el.children.p((el) => {
      el.config.dataAttribute("message")
      el.children.textNode((get) => get(message))
    })
  })
}
