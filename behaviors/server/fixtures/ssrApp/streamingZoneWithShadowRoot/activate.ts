import { activateZone } from "@view/index.js"
import { clicks, zoneView } from "./view"

activateZone({
  storeId: "shadow-zone-store",
  stateManifest: { clicks },
  setupView(activate) {
    activate(document.querySelector(`[data-zone="shadow"]`)!, zoneView)
  },
})
