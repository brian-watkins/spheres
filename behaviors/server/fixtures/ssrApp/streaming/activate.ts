import view from "./view"
import { serializedTokens, someWord, thingValue } from "./state"
import { activateZone } from "@view/index"
import { useContainerHooks, write } from "@store/index"

const { store } = activateZone({
  stateManifest: serializedTokens,
  view(activate) {
    activate(document.body, view)
  },
})

useContainerHooks(store, someWord, {
  onWrite(message, actions) {
    actions.ok(`Transformed in hook: ${message}`)
  },
})

await store.initialized

store.dispatch(write(thingValue, "hundreds of"))