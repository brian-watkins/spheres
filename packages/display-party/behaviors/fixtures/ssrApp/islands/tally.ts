import { view } from "@src/index.js"
import { clickCount } from "../state.js"

export default view()
  .withState({
    view: get => {
      return view()
        .p(el => {
          el.config
            .dataAttribute("click-count")
          el.view
            .text(`You've clicked the button ${get(clickCount)} times!`)
        })
    }
  })