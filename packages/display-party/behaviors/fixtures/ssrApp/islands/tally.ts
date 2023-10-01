import { htmlView } from "@src/index.js"
import { clickCount } from "../state.js"

export default htmlView()
  .andThen(get => {
    return htmlView()
      .p(el => {
        el.config
          .dataAttribute("click-count")
        el.children
          .textNode(`You've clicked the button ${get(clickCount)} times!`)
      })
  })