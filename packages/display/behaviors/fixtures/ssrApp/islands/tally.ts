import { HTMLBuilder, HTMLView } from "@src/index.js"
import { clickCount } from "../state.js"
import { GetState } from "@spheres/store"

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
      .textNode(get => `You've clicked the button ${get(clickCount)} times!`)
  })
}

function evenOddZone(root: HTMLBuilder, get: GetState) {
  if (get(clickCount) % 2 === 0) {
    evenCounterDisplay(root)
  } else {
    oddCounterDisplay(root)
  }
}

export default function (root: HTMLBuilder) {
  root.zoneWithState(evenOddZone)
}