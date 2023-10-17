import { createDisplay } from "@spheres/display";
import { converter } from "./app.js";

const display = createDisplay()
display.mount(document.getElementById("app")!, converter())