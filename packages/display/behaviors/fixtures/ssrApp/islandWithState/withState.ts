import { HTMLView, htmlTemplate } from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, rule, use, write } from "@spheres/store"

export const view = htmlTemplate(() => {
  return root =>
    root.zone((get) => {
      return root => root.div(el => {
        el.config.id("nested-state-island")
        el.children
          .h1(el => {
            el.children.textNode(`This is ${get(nameState)}'s stuff!`)
          })
          .zone(counterView())
          .hr()
          .zone(tallyView)
          .hr()
          .zone(tallyView)
      })
    })
})

const incrementCount = rule(get => write(clickCount, get(clickCount) + 1))

const counterView = htmlTemplate(() => root => {
  root.div(el => {
    el.children
      .button(el => {
        el.config.on("click", () => use(incrementCount))
        el.children.textNode("Click me!")
      })
  })
})

function tallyView(get: GetState): HTMLView {
  return root => root.p(el => {
    el.config.dataAttribute("click-count")
    el.children.textNode(`You've clicked the button ${get(clickCount)} times!`)
  })
}