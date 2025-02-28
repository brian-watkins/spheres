import { createStore } from "spheres/store";
import { activateView } from "spheres/view";
import { anotherView } from "./anotherView";


export function activate() {
  activateView(createStore(), document.body, anotherView)
}

activate()