import { createDisplay } from "display-party";
import { flightBooker } from "./view.js";

const display = createDisplay()
display.mount(document.getElementById("app")!, flightBooker())