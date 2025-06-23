import { view } from "./view"
import { activateZone } from "@view/index"

activateZone({
  view(activate) {
    activate(document.body, view)
  }
})