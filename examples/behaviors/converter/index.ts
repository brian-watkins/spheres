import { renderToDOM } from "@spheres/view";
import { converter } from "../../src/converter/app.js";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("test-display")!, converter())