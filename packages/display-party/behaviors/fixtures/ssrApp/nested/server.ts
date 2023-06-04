import { Store } from "state-party";
import viewGenerator from "./view.js"
import { renderToString } from "@src/index.js";

const store = new Store()

export default function() {
  return renderToString(store, viewGenerator())
}