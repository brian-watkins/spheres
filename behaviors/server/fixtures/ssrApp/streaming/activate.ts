import view from "./view"
import { serializedTokens, someWord, thingValue } from "./state"
import { activateZone } from "@view/index"
import { useContainerHooks, write } from "@store/index"

const { store } = await activateZone({
  stateManifest: serializedTokens,
  configureStore(store) {
    useContainerHooks(store, someWord, {
      onWrite(message, actions) {
        actions.ok(`Transformed in hook: ${message}`)
      }
    })
  },
  setupView(activate) {
    activate(document.body, view)
  },
})

store.dispatch(write(thingValue, "hundreds of"))