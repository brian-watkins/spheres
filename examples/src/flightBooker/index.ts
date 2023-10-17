import { createDisplay } from "@spheres/display";
import { flightBooker } from "./view.js";

const display = createDisplay()
display.mount(document.getElementById("app")!, flightBooker())