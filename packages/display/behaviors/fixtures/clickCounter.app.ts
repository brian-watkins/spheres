import { HTMLBuilder, HTMLView } from "@src/index.js"
import { GetState, container, rule, use, write } from "@spheres/store"

const clickCount = container({ initialValue: 0 })

const incrementCount = rule(get => write(clickCount, get(clickCount) + 1))

function clickCounterView(get: GetState): HTMLView {
  return (root) => root.div(div => {
    div.children
      .button(b => {
        b.config.on("click", () => use(incrementCount))
        b.children.textNode("Click me!")
      })
      .p(p => {
        p.config.dataAttribute("click-count")
        p.children.textNode(`You've click the button ${get(clickCount)} times!`)
      })
  })
}

export default function view(root: HTMLBuilder) {
  root.div(div => {
    div.children
      .h1(h1 => h1.children.textNode("This is the click counter!"))
      .zoneWithState(clickCounterView)
  })
}

