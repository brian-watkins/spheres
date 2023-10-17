import { Store } from "@spheres/store";
import viewGenerator from "./view.js"
import { renderToString, htmlView } from "@src/index.js";

const store = new Store()

export default function() {
  return renderToString(store, theView())
}

function theView() {
  return htmlView()
    .div(el => {
      el.children
        .div(el => {
          el.config.id("fragment-a")
          el.children.zone(viewGenerator)
        })
        .div(el => {
          el.config.id("fragment-b")
          el.children.zone(viewGenerator)
        })
    })
}