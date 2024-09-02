import { HTMLBuilder } from "@src/index.js"
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
  root.zoneWhich(get => get(clickCount) % 2 === 0 ? "even" : "odd", {
    even: evenCounterDisplay,
    odd: oddCounterDisplay
  })
}
