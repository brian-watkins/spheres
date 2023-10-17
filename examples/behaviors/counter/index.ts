import { createDisplay } from "@spheres/display";
import { counter } from "../../src/counter/app.js";

const display = createDisplay()
display.mount(document.getElementById("test-display")!, counter())