import { container, update } from "@store/index.js"
import { HTMLBuilder } from "@view/index.js"

export const clicks = container({ initialValue: 0 })

export function page(root: HTMLBuilder) {
  root.html((el) => {
    el.children
      .head((el) => {
        el.children.link((el) => {
          el.config.rel("icon").href("data:,")
        })
      })
      .body((el) => {
        el.children.main((el) => {
          el.children.div((el) => {
            el.config.dataAttribute("zone", "shadow")
            el.children.h2((el) => el.children.textNode("Loading ..."))
          })
        })
      })
  })
}

export function zoneView(root: HTMLBuilder) {
  root.div((el) => {
    el.children
      .div((el) => {
        el.config.dataAttribute("shadow-host")
        el.config.shadowRoot((el) => {
          el.config.shadowrootmode("open")
          el.children.p((el) => el.children.textNode("In the shadows!")).slot()
        })
        el.children.button((el) => {
          el.config.on("click", () => update(clicks, (count) => count + 1))
          el.children.textNode("Click me")
        })
      })
      .h3((el) => {
        el.children.textNode((get) => `Clicks: ${get(clicks)}`)
      })
  })
}
