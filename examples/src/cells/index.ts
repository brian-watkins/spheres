import { renderToDOM } from "@spheres/view";
import { cells } from "./view";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("app")!, cells())