import { createDisplay } from "display-party";
import { counter } from "./app.js";

const display = createDisplay()
display.mount(document.getElementById("app")!, counter())