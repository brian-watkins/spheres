import { HTMLBuilder } from "@view/index.js"
import { clickCount } from "../state.js"

function evenCounterDisplay(root: HTMLBuilder) {
  root.p(el => {
    el.config
      .dataAttribute("click-count")
      .dataAttribute("isEven", "true")
    el.children
      .textNode(get => `You've clicked the button ${get(clickCount)} times!`)
  })
}

function oddCounterDisplay(root: HTMLBuilder) {
  root.p(el => {
    el.config
      .dataAttribute("click-count")
    el.children
      .textNode(get => `Odd! You've clicked the button ${get(clickCount)} times!`)
  })
}

export default function(root: HTMLBuilder) {
  root.subviewOf(select => select
    .when(get => get(clickCount) % 2 === 0, evenCounterDisplay)
    .default(oddCounterDisplay)
  )
}
