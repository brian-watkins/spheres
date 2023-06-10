import { view } from "@src/index.js"
import { GetState, container, selection, store, write } from "state-party"

const clickCount = container({ initialValue: 0 })

const incrementCount = selection(get => write(clickCount, get(clickCount) + 1))

const clickCounterView = (get: GetState) => {
  return view()
    .div(div => {
      div.view
        .button(b => {
          b.config.onClick(() => store(incrementCount))
          b.view.text("Click me!")
        })
        .p(p => {
          p.config.dataAttribute("click-count")
          p.view.text(`You've click the button ${get(clickCount)} times!`)
        })
    })
}

export default function () {
  return view()
    .div(div => {
      div.view
        .h1(h1 => h1.view.text("This is the click counter!"))
        .withState({ view: clickCounterView })
    })
}

