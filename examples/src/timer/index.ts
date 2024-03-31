import timer from "./view.js";
import { Store } from "@spheres/store";
import { runTimerCommand } from "./state.js";
import { RepeaterCommandManager } from "./systemRepeater.js";
import { renderToDOM } from "@spheres/display";

const store = new Store()
store.useCommand(runTimerCommand, new RepeaterCommandManager(store))

renderToDOM(store, document.getElementById("app")!, timer())
