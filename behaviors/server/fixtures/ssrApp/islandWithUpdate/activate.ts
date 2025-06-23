import { useHooks } from "@store/index.js";
import { view } from "./view";
import { serializedTokens } from "./state";
import { activateZone } from "@view/index";

const { store } = activateZone({
  stateMap: serializedTokens,
  view(activate) {
    activate(document.body, view)
  }
})

useHooks(store, {
  onRegister() {
    // do something with the container
  }
})
