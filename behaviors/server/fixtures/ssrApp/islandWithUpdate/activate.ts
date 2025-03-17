import { createStore, useHooks } from "@store/index.js";
import { activateView } from "@view/index";
import { view } from "./view";
import { tokenMap } from "./state";

const store = createStore()
store.deserialize(tokenMap)

useHooks(store, {
  onRegister() {
    // do something with the container
  }
})

activateView(store, document.body, view)