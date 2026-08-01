import { view } from "./view"
import { activateZone } from "@view/index"

activateZone({
  setupView(activate) {
    activate(document.body, view)
  }
})