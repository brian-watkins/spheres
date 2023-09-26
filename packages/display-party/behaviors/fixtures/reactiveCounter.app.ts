import { view } from "@src/index.js"
import { container, selection, store, write } from "state-party"

const clickCount = container({ initialValue: 0 })

const incrementCount = selection(get => write(clickCount, get(clickCount) + 1))

export default function () {
  return view()
    .div(div => {
      div.children
        .h1(h1 => h1.children.text("This is the click counter!"))
        .div(div => {
          div.children
            .button(b => {
              b.config.on("click", () => store(incrementCount))
              b.children.text("Click me!")
            })
            .p(p => {
              p.config.dataAttribute("click-count")
              p.children.text((get) => `You've clicked the button ${get(clickCount)} times!`)
            })
        })
    })
}

