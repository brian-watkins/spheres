import timer from "./view.js";
import { createStore, useCommand } from "spheres/store";
import { runTimerCommand } from "./state.js";
import { RepeaterCommandManager } from "./systemRepeater.js";
import { renderToDOM } from "spheres/view";

const store = createStore()
useCommand(store, runTimerCommand, new RepeaterCommandManager(store))

renderToDOM(store, document.getElementById("app")!, timer)
