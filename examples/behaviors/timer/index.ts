import { createDisplay } from "@spheres/display"
import { timer } from "../../src/timer/view.js"
import { Store } from "@spheres/store"
import { timerProvider } from "../../src/timer/state.js"
import { TestRepeater } from "./testRepeater.js"

window.__testRepeater = new TestRepeater()

const store = new Store()
store.useProvider(timerProvider(window.__testRepeater))

const display = createDisplay(store)
display.mount(document.getElementById("test-display")!, timer())