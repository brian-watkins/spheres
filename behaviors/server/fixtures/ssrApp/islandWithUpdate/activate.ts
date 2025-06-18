import { createStore, deserialize, useHooks } from "@store/index.js";
import { activateView } from "@view/index";
import { view } from "./view";
import { serializedTokens } from "./state";

const store = createStore()
deserialize(store, serializedTokens)

useHooks(store, {
  onRegister() {
    // do something with the container
  }
})

activateView(store, document.body, view)