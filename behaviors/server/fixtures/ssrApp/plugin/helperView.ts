import { container } from "spheres/store";
import { HTMLBuilder, HTMLView, UseData } from "spheres/view";
import "./moreStyles.css"

const items = container({ initialValue: ["one", "two", "three"] })

export function superList(root: HTMLBuilder) {
  root.ul(el => {
    el.children.subviews(get => get(items), itemView)
  })
}

const { dynamic } = await import("./dynamicView")

function itemView(useState: UseData<string>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children
        .subview(dynamic)
        .div(el => {
          el.children.textNode(useState((state) => state))
        })
    })
  }
}