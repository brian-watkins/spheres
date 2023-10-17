import { createDisplay } from "@spheres/display";
import { flightBooker } from "../../src/flightBooker/view.js";

const display = createDisplay()
display.mount(document.getElementById("test-display")!, flightBooker())