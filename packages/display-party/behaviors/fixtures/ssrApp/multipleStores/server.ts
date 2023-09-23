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
      el.children
        .div(el => {
          el.config.id("fragment-a")
          el.children.view(viewGenerator)
        })
        .div(el => {
          el.config.id("fragment-b")
          el.children.view(viewGenerator)
        })
    })
}