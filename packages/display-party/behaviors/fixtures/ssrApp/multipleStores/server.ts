import * as View from "@src/index.js"
import { Store } from "state-party";
import viewGenerator from "./view.js"
import { render } from "@src/index.js";

const store = new Store()

export default function() {
  return render(store, View.div([], [
    View.div([View.id("fragment-a")], [viewGenerator()]),
    View.div([View.id("fragment-b")], [viewGenerator()]),
  ]))
}