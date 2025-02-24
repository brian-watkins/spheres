import { container, State } from "@store/index";
import { HTMLBuilder, HTMLView } from "@view/index";
import "./moreStyles.css"

const items = container({ initialValue: [ "one", "two", "three" ]})

export function superList(root: HTMLBuilder) {
  root.ul(el => {
    el.children.subviews(get => get(items), itemView)
  })
}

function itemView(state: State<string>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children.textNode(get => get(state))
    })
  }
}