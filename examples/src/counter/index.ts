import { createDisplay } from "@spheres/display";
import { counter } from "./app.js";

const display = createDisplay()
display.mount(document.getElementById("app")!, counter())