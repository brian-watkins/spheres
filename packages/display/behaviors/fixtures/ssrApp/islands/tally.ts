import { HTMLBuilder, HTMLView, htmlTemplate } from "@src/index.js"
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

function evenOddZone(get: GetState): HTMLView {
  if (get(clickCount) % 2 === 0) {
    return root => evenCounterDisplay(root)
  } else {
    return root => oddCounterDisplay(root)
  }
}

export default htmlTemplate(() => root => {
  root.zone(evenOddZone)
})