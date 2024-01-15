import { createDisplay } from "@spheres/display";
import { timer } from "./view.js";
import { Store } from "@spheres/store";
import { runTimerCommand } from "./state.js";
import { RepeaterCommandManager } from "./systemRepeater.js";

const store = new Store()
store.useCommand(runTimerCommand, new RepeaterCommandManager(store))

const display = createDisplay(store)
display.mount(document.getElementById("app")!, timer())
