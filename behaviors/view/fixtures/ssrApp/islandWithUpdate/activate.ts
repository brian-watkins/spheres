import { activateStore } from "@spheres/store";
import { activateView } from "@src/index";
import { view } from "./view";

const store = activateStore()

store.useHooks({
  onRegister() {
    // do something with the container
  },
})

activateView(store, document.body, view)