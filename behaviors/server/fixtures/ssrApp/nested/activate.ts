import { activateZone } from "@view/index.js"
import superIsland from "./nestedIsland.js"

activateZone({
  view(activate) {
    activate(document.getElementById("super-island")!, superIsland)
  }
})