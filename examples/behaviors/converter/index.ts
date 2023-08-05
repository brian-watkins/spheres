import { createDisplay } from "display-party";
import { converter } from "../../src/converter/app.js";

const display = createDisplay()
display.mount(document.getElementById("test-display")!, converter())