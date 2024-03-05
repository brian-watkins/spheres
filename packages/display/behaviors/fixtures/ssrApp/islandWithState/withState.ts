import { HTMLBuilder } from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, rule, use, write } from "@spheres/store"

export default function view(root: HTMLBuilder) {
  root.zoneWithState((root, get) => {
    root.div(el => {
      el.config.id("nested-state-island")
      el.children
        .h1(el => {
          el.children.textNode(`This is ${get(nameState)}'s stuff!`)
        })
        .zone(counterView)
        .hr()
        .zoneWithState(tallyView)
        .hr()
        .zoneWithState(tallyView)
    })
  })
}

const incrementCount = rule(get => write(clickCount, get(clickCount) + 1))

function counterView(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .button(el => {
        el.config.on("click", () => use(incrementCount))
        el.children.textNode("Click me!")
      })
  })
}

function tallyView(root: HTMLBuilder, get: GetState) {
  root.p(el => {
    el.config.dataAttribute("click-count")
    el.children.textNode(`You've clicked the button ${get(clickCount)} times!`)
  })
}