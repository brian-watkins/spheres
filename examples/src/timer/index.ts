import { createDisplay } from "@spheres/display";
import { timer } from "./view.js";
import { Store } from "@spheres/store";
import { timerProvider } from "./state.js";
import { systemRepeater } from "./systemRepeater.js";

const store = new Store()
store.useProvider(timerProvider(systemRepeater))

const display = createDisplay(store)
display.mount(document.getElementById("app")!, timer())
