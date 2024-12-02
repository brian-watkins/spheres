import { createStore, write } from "@spheres/store";
import viewGenerator from "./view.js"
import { renderToString } from "@src/index.js";
import { SSRParts } from "helpers/ssrApp.js";
import { clickCount } from "../state.js";

const storeA = createStore("store-a")
storeA.dispatch(write(clickCount, 4))

const storeB = createStore("store-b")
storeB.dispatch(write(clickCount, 2))

export default function (): SSRParts {
  return {
    html: `
<div>
  <div id="fragment-a">${renderToString(storeA, viewGenerator)}</div>
  <div id="fragment-b">${renderToString(storeB, viewGenerator)}</div>
</div>`,
    serializedStore: `
${storeA.serialize()}
${storeB.serialize()}`
  }
}

// function page(root: HTMLBuilder) {
//   root.div(el => {
//     el.children
//       .div(el => {
//         el.config.id("fragment-a")
//         el.children.subview(viewGenerator)
//       })
//       .div(el => {
//         el.config.id("fragment-b")
//         el.children.subview(viewGenerator)
//       })
//   })
// }
