import { renderToDOM } from "@spheres/display";
import { cells } from "./view";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("app")!, cells())