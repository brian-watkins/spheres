import { view } from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, selection, store, write } from "state-party"

export default view()
  .withState({
    view: get => {
      return view()
        .div(el => {
          el.config.id("nested-state-island")
          el.view
            .h1(el => {
              el.view.text(`This is ${get(nameState)}'s stuff!`)
            })
            .withState({ view: counterView })
            .hr()
            .withState({ view: tallyView })
            .hr()
            .withState({ view: tallyView })
        })
    }
  })

const incrementCount = selection(get => write(clickCount, get(clickCount) + 1))

function counterView() {
  return view()
    .div(el => {
      el.view
        .button(el => {
          el.config.onClick(() => store(incrementCount))
          el.view.text("Click me!")
        })
    })
}

function tallyView(get: GetState) {
  return view()
    .p(el => {
      el.config.dataAttribute("click-count")
      el.view.text(`You've clicked the button ${get(clickCount)} times!`)
    })
}