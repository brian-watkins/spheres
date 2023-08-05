import { createDisplay } from "display-party";
import { counter } from "../../src/counter/app.js";

const display = createDisplay()
display.mount(document.getElementById("test-display")!, counter())