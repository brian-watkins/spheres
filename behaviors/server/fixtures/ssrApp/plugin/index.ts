import { createStore } from "@store/store"
import { activateView } from "@view/index"
import { funView } from "./view"


export function activate() {
  activateView(createStore(), document.body, funView)
}

activate()