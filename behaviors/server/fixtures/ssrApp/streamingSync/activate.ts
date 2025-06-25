import view from "./view"
import { serializedTokens, thingValue } from "./state"
import { activateZone } from "@view/index"
import { write } from "@store/index"

const { store } = activateZone({
  stateMap: serializedTokens,
  view(activate) {
    activate(document.body, view)
  },
})

await store.initialized

store.dispatch(write(thingValue, "hundreds of"))