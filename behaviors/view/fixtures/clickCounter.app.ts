import { HTMLBuilder } from "@view/index.js"
import { container, GetState, use, write } from "@store/index.js"

const clickCount = container({ initialValue: 0 })

const incrementCount = (get: GetState) => write(clickCount, get(clickCount) + 1)

function clickCounterView(root: HTMLBuilder) {
  root.div(div => {
    div.children
      .button(b => {
        b.config.on("click", () => use(incrementCount))
        b.children.textNode("Click me!")
      })
      .p(p => {
        p.config.dataAttribute("click-count")
        p.children.textNode(get => `You've click the button ${get(clickCount)} times!`)
      })
  })
}

export default function (root: HTMLBuilder) {
  root.div(div => {
    div.children
      .h1(h1 => h1.children.textNode("This is the click counter!"))
      .subview(clickCounterView)
  })
}
