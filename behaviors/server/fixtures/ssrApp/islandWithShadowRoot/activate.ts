import { activateZone } from "@view/index.js"
import { view } from "./withShadowRoot.js"

activateZone({
  setupView(activate) {
    activate(document.getElementById("shadow-root-island")!, view)
  },
})
