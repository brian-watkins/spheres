import { activateZone } from "@view/index.js"
import { addItemButton, itemList } from "./view"
import { serializedTokens } from "./state"

activateZone({
  stateManifest: serializedTokens,
  setupView: (activate) => {
    activate(document.querySelector("#add-item")!, addItemButton)
    activate(document.querySelector("OL")!, itemList)
  },
})
