import { createDisplay } from "display-party";
import { converter } from "./app.js";

const display = createDisplay()
display.mount(document.getElementById("app")!, converter())