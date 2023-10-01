import { htmlView } from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, selection, store, write } from "state-party"

export default htmlView()
  .andThen(get => {
    return htmlView()
      .div(el => {
        el.config.id("nested-state-island")
        el.children
          .h1(el => {
            el.children.textNode(`This is ${get(nameState)}'s stuff!`)
          })
          .andThen(counterView)
          .hr()
          .andThen(tallyView)
          .hr()
          .andThen(tallyView)
      })
  })

const incrementCount = selection(get => write(clickCount, get(clickCount) + 1))

function counterView() {
  return htmlView()
    .div(el => {
      el.children
        .button(el => {
          el.config.on("click", () => store(incrementCount))
          el.children.textNode("Click me!")
        })
    })
}

function tallyView(get: GetState) {
  return htmlView()
    .p(el => {
      el.config.dataAttribute("click-count")
      el.children.textNode(`You've clicked the button ${get(clickCount)} times!`)
    })
}