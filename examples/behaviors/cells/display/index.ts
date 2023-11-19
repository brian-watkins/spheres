import { createDisplay } from "@spheres/display";
import { cells } from "../../../src/cells/view";

const display = createDisplay()
display.mount(document.getElementById("test-display")!, cells())
