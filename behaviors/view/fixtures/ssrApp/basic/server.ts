import { createStore } from "@spheres/store";
import viewGenerator from "./view.js"
import { renderToString } from "@src/index.js";
import { SSRParts } from "helpers/ssrApp.js";

const store = createStore()

export default function(): SSRParts {
  return {
    html: renderToString(store, viewGenerator)
  }
}