import { createDisplay } from "display-party"
import { timer } from "../../src/timer/view.js"
import { Store } from "state-party"
import { timerProvider } from "../../src/timer/state.js"
import { TestRepeater } from "./testRepeater.js"

window.__testRepeater = new TestRepeater()

const store = new Store()
store.useProvider(timerProvider(window.__testRepeater))

const display = createDisplay(store)
display.mount(document.getElementById("test-display")!, timer())