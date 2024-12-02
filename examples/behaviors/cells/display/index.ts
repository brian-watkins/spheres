import { renderToDOM } from "spheres/view";
import { cells } from "../../../src/cells/view";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("test-display")!, cells)
