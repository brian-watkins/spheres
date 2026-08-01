import view from "./view"
import { serializedTokens, thingValue } from "./state"
import { activateZone } from "@view/index"
import { write } from "@store/index"

const { store } = await activateZone({
  stateManifest: serializedTokens,
  setupView(activate) {
    activate(document.body, view)
  },
})

store.dispatch(write(thingValue, "hundreds of"))