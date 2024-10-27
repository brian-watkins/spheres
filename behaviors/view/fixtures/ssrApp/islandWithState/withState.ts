import { HTMLBuilder } from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, use, write } from "@spheres/store"

export function view(root: HTMLBuilder) {
  root.div(el => {
    el.config.id("nested-state-island")
    el.children
      .h1(el => {
        el.children.textNode(get => `This is ${get(nameState)}'s stuff!`)
      })
      .subview(counterView)
      .hr()
      .subview(tallyView)
      .hr()
      .subview(tallyView)
  })
}

const incrementCount = (get: GetState) => write(clickCount, get(clickCount) + 1)

function counterView(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .button(el => {
        el.config.on("click", () => use(incrementCount))
        el.children.textNode("Click me!")
      })
  })
}

function tallyView(root: HTMLBuilder) {
  root.p(el => {
    el.config
      .dataAttribute("click-count", get => `${get(clickCount)}`)
      .class(get => get(clickCount) % 2 === 0 ? "even-style" : "odd-style")
    el.children
      .textNode(get => `You've clicked the button ${get(clickCount)} times!`)
  })
}
