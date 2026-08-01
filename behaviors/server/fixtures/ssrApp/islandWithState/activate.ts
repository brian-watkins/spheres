import { activateZone } from "@view/index.js"
import { view } from "./withState.js"

activateZone({
  setupView(activate) {
    activate(document.getElementById("nested-state-island")!, view)
  },
})
