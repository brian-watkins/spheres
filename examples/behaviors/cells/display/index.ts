import { renderToDOM } from "@spheres/view";
import { cells } from "../../../src/cells/view";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("test-display")!, cells())
