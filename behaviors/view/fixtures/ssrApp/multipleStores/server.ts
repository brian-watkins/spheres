import { Store } from "@spheres/store";
import viewGenerator from "./view.js"
import { HTMLBuilder, renderToString } from "@src/index.js";

const store = new Store()

export default function () {
  return renderToString(store, template)
}

function template(root: HTMLBuilder) {
  root.div(el => {
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