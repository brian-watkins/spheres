import { createStore } from "@store/index.js";
import viewGenerator from "./view.js"
import { renderToString } from "@server/index.js";
import { SSRParts } from "../../../helpers/ssrApp.js";

const store = createStore()

export default function(): SSRParts {
  return {
    html: renderToString(store, viewGenerator)
  }
}