import { renderToDOM } from "@spheres/display";
import { converter } from "../../src/converter/app.js";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("test-display")!, converter())