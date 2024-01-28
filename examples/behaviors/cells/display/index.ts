import { renderToDOM } from "@spheres/display";
import { cells } from "../../../src/cells/view";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("test-display")!, cells())
