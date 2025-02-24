import { createStore } from "@store/index";
import { activateView } from "@view/index";
import { anotherView } from "./anotherView";


export function activate() {
  activateView(createStore(), document.body, anotherView)
}

activate()