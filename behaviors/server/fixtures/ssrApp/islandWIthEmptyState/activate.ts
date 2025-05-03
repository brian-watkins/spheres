import { createStore } from "@store/store"
import { activateView } from "@view/index"
import { view } from "./view"

const store = createStore()
activateView(store, document.body, view)
