import { createDisplay } from "@spheres/display";
import circles from "./view";

const display = createDisplay()
display.mount(document.getElementById("app")!, circles())