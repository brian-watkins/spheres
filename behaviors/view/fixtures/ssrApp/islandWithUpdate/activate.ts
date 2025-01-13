import { createStore } from "@spheres/store";
import { activateView } from "@src/index";
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