import { createDisplay } from "display-party";
import { timer } from "./view.js";
import { Store } from "state-party";
import { timerProvider } from "./state.js";
import { systemRepeater } from "./systemRepeater.js";

const store = new Store()
store.useProvider(timerProvider(systemRepeater))

const display = createDisplay(store)
display.mount(document.getElementById("app")!, timer())
