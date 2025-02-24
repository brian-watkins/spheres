import { activateView } from "@view/index.js"
import { view } from "./withState.js"
import { createStore } from "@store/index.js"

const store = createStore()
activateView(store, document.getElementById("nested-state-island")!, view)
