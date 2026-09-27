import { update } from "@store/index.js"
import { HTMLBuilder, HTMLView, UseItem } from "@view/index.js"
import { clicks, items } from "./state"

export function view(root: HTMLBuilder) {
  root.main((el) => {
    el.children
      .div((el) => {
        el.config.id("click-count")
        el.children.subview(clickCount)
      })
      .ol((el) => {
        el.children.subview(itemList)
      })
  })
}

export function clickCount(root: HTMLBuilder) {
  root.p((el) => {
    el.config.dataAttribute("click-count")
    el.children.textNode((get) => `Clicks: ${get(clicks)}`)
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
      el.children
        .div((el) => {
          el.config.shadowRoot((el) => {
            el.children.slot()
          })
          el.children.button((el) => {
            el.config.dataAttribute("item-button")
            el.config.on("click", () => update(clicks, (count) => count + 1))
            el.children.textNode("Click me")
          })
        })
        .button((el) => {
          el.config.dataAttribute("item-sibling-button")
          el.config.on("click", () => update(clicks, (count) => count + 1))
          el.children.textNode("Click me too")
        })
    })
  }
}
