import { createDisplay } from "display-party";
import circles from "./view";

const display = createDisplay()
display.mount(document.getElementById("app")!, circles())