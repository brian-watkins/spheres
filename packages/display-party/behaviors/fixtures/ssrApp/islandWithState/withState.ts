import { view } from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, selection, store } from "state-party"

export default view()
  .withState(get => {
    return view()
      .div(el => {
        el.config.id("nested-state-island")
        el.view
          .h1(el => {
            el.view.text(`This is ${get(nameState)}'s stuff!`)
          })
          .withState(counterView)
          .hr()
          .withState(tallyView)
          .hr()
          .withState(tallyView)
      })
  })

const incrementCount = selection(clickCount, ({current}) => current + 1)

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