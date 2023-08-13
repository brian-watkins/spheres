import { createDisplay } from "display-party";
import { flightBooker } from "../../src/flightBooker/view.js";

const display = createDisplay()
display.mount(document.getElementById("test-display")!, flightBooker())