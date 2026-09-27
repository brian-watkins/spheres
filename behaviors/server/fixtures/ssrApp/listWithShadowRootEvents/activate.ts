import { activateZone } from "@view/index.js"
import { clickCount, itemList } from "./view"
import { serializedTokens } from "./state"

activateZone({
  stateManifest: serializedTokens,
  setupView: (activate) => {
    activate(document.querySelector("#click-count")!, clickCount)
    activate(document.querySelector("OL")!, itemList)
  },
})
