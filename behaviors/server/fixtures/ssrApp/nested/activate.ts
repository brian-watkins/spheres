import { activateZone } from "@view/index.js"
import superIsland from "./nestedIsland.js"

activateZone({
  setupView(activate) {
    activate(document.getElementById("super-island")!, superIsland)
  }
})