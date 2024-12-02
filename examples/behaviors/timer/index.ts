import timer from "../../src/timer/view.js"
import { createStore } from "spheres/store"
import { TestRepeaterManager } from "./testRepeater.js"
import { runTimerCommand } from "../../src/timer/state.js"
import { renderToDOM } from "spheres/view"

const store = createStore()
window.__testRepeater = new TestRepeaterManager(store)
store.useCommand(runTimerCommand, window.__testRepeater)

renderToDOM(store, document.getElementById("test-display")!, timer)