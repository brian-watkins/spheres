import { HTMLBuilder } from "@src/htmlElements"

export default function (root: HTMLBuilder) {
  root.div(el => el.config.innerHTML("<h3>Hello!!!</h3>"))
}