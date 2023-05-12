import { Store } from "state-party";
import viewGenerator from "./view.js"
import { render } from "@src/index.js";

const store = new Store()

export default function() {
  return render(store, viewGenerator())
}