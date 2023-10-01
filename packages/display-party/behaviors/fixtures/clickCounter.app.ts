import { htmlView } from "@src/index.js"
import { GetState, container, selection, store, write } from "state-party"

const clickCount = container({ initialValue: 0 })

const incrementCount = selection(get => write(clickCount, get(clickCount) + 1))

const clickCounterView = (get: GetState) => {
  return htmlView()
    .div(div => {
      div.children
        .button(b => {
          b.config.on("click", () => store(incrementCount))
          b.children.textNode("Click me!")
        })
        .p(p => {
          p.config.dataAttribute("click-count")
          p.children.textNode(`You've click the button ${get(clickCount)} times!`)
        })
    })
}

export default function () {
  return htmlView()
    .div(div => {
      div.children
        .h1(h1 => h1.children.textNode("This is the click counter!"))
        .andThen(clickCounterView)
    })
}

