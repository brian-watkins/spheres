import { createDisplay } from "display-party";
import crud from "./view.js";

const display = createDisplay()
display.mount(document.getElementById("app")!, crud())