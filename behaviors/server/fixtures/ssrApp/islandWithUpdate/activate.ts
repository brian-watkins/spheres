import { useHooks } from "@store/index.js";
import { view } from "./view";
import { serializedTokens } from "./state";
import { activateZone } from "@view/index";

activateZone({
  stateManifest: serializedTokens,
  configureStore(store) {
    useHooks(store, {
      onRegister() {
        // do something with the container
      }
    })  
  },
  setupView(activate) {
    activate(document.body, view)
  }
})