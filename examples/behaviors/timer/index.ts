import { createDisplay } from "@spheres/display"
import { timer } from "../../src/timer/view.js"
import { Store } from "@spheres/store"
import { TestRepeaterManager } from "./testRepeater.js"
import { runTimerCommand } from "../../src/timer/state.js"

const store = new Store()
window.__testRepeater = new TestRepeaterManager(store)
store.useCommand(runTimerCommand, window.__testRepeater)

const display = createDisplay(store)
display.mount(document.getElementById("test-display")!, timer())