import { createStore } from "@store/index.js";
import viewGenerator from "./view.js"
import { createStringRenderer } from "@server/index.js";
import { SSRParts } from "../../../helpers/ssrApp.js";

const store = createStore()

export default function(): SSRParts {
  return {
    html: createStringRenderer(viewGenerator)(store)
  }
}