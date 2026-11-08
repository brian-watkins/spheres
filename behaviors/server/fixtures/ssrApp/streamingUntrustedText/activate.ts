import view from "./view"
import { serializedTokens } from "./state"
import { activateZone } from "@view/index"

await activateZone({
  stateManifest: serializedTokens,
  setupView(activate) {
    activate(document.body, view)
  },
})
