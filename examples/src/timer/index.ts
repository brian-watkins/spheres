import { createDisplay } from "display-party";
import { timer } from "./view.js";
import { Store } from "state-party";
import { timerProvider } from "./state.js";

const store = new Store()
store.useProvider(timerProvider)

const display = createDisplay(store)
display.mount(document.getElementById("app")!, timer())
