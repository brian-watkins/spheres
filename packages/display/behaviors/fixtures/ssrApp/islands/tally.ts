import { htmlView } from "@src/index.js"
import { clickCount } from "../state.js"

const evenCounterDisplay =
  htmlView(root => {
    root.p(el => {
      el.config
        .dataAttribute("click-count")
        .dataAttribute("isEven", "true")
      el.children
        .textNode((get) => `You've clicked the button ${get(clickCount)} times!`)
    })
  })

const oddCounterDisplay =
  htmlView(root => {
    root.p(el => {
      el.config
        .dataAttribute("click-count")
      el.children
        .textNode((get) => `You've clicked the button ${get(clickCount)} times!`)
    })
  })

export default htmlView(root => {
  root.zone(get => {
    return get(clickCount) % 2 === 0 ? evenCounterDisplay : oddCounterDisplay
  })
})