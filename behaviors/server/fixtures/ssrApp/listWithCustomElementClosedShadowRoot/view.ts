import { update } from "@store/index.js"
import { HTMLBuilder, HTMLView, UseItem } from "@view/index.js"
import { items } from "./state"

export function view(root: HTMLBuilder) {
  root.main((el) => {
    el.children
      .div((el) => {
        el.config.id("add-item")
        el.children.subview(addItemButton)
      })
      .ol((el) => {
        el.children.subview(itemList)
      })
  })
}

export function addItemButton(root: HTMLBuilder) {
  root.button((el) => {
    el.config.on("click", () => update(items, (list) => [...list, `item-${list.length + 1}`]))
    el.children.textNode("Add Item")
  })
}

export function itemList(root: HTMLBuilder) {
  root.subviews((get) => get(items), itemView)
}

function itemView(useItem: UseItem<string>): HTMLView {
  return (root) => {
    root.li((el) => {
      el.config.dataAttribute(
        "item",
        useItem((item) => item.data),
      )
      el.children.element("shadow-card", (el) => {
        el.children.template((el) => {
          el.config.shadowrootmode("closed")
          el.children.p((el) => el.children.textNode("In the shadows!"))
        })
      })
    })
  }
}
