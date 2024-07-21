import { HTMLBuilder } from "@src/index"

export default function (root: HTMLBuilder) {
  root.div(el => el.config.innerHTML("<h3>Hello!!!</h3>"))
}