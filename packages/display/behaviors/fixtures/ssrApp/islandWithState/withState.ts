import { htmlView } from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, rule, use, write } from "@spheres/store"

export default htmlView()
  .zone(get => {
    return htmlView()
      .div(el => {
        el.config.id("nested-state-island")
        el.children
          .h1(el => {
            el.children.textNode(`This is ${get(nameState)}'s stuff!`)
          })
          .zone(counterView)
          .hr()
          .zone(tallyView)
          .hr()
          .zone(tallyView)
      })
  })

const incrementCount = rule(get => write(clickCount, get(clickCount) + 1))

function counterView() {
  return htmlView()
    .div(el => {
      el.children
        .button(el => {
          el.config.on("click", () => use(incrementCount))
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