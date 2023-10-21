import { createDisplay } from "@spheres/display";
import { cells } from "./view";

const display = createDisplay()
display.mount(document.getElementById("app")!, cells())