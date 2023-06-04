import { Store } from "state-party";
import viewGenerator from "./view.js"
import { renderToString, view } from "@src/index.js";

const store = new Store()

export default function() {
  return renderToString(store, theView())
}

function theView() {
  return view()
    .div(el => {
      el.view
        .div(el => {
          el.config.id("fragment-a")
          el.view.withView(viewGenerator())
        })
        .div(el => {
          el.config.id("fragment-b")
          el.view.withView(viewGenerator())
        })
    })
}