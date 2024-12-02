import timer from "./view.js";
import { createStore } from "spheres/store";
import { runTimerCommand } from "./state.js";
import { RepeaterCommandManager } from "./systemRepeater.js";
import { renderToDOM } from "spheres/view";

const store = createStore()
store.useCommand(runTimerCommand, new RepeaterCommandManager(store))

renderToDOM(store, document.getElementById("app")!, timer)
