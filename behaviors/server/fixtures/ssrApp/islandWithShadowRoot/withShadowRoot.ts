import { HTMLBuilder } from "@view/index.js"
import { clickCount } from "../state.js"
import { GetState, use, write } from "@store/index.js"

const incrementCount = (get: GetState) => write(clickCount, get(clickCount) + 1)

export function view(root: HTMLBuilder) {
  root.div((el) => {
    el.children
      .div((el) => {
        el.config.id("shadow-host")
        el.children.template((el) => {
          el.config.shadowrootmode("open")
          el.children.p((el) => el.children.textNode("In the shadows!"))
        })
      })
      .button((el) => {
        el.config.on("click", () => use(incrementCount))
        el.children.textNode("Click me!")
      })
      .p((el) => {
        el.config.dataAttribute("click-count")
        el.children.textNode((get) => `You've clicked the button ${get(clickCount)} times!`)
      })
  })
}
