import { createStore } from "@store/index.js";
import { activateView } from "@view/index";
import { view } from "./view";
import { tokenMap } from "./state";

const store = createStore()
store.deserialize(tokenMap)

store.useHooks({
  onRegister() {
    // do something with the container
  },
})

activateView(store, document.body, view)