import { activateView } from "@src/index.js"
import { view } from "./withState.js"
import { createStore } from "@spheres/store"

const store = createStore()
activateView(store, document.getElementById("nested-state-island")!, view)
