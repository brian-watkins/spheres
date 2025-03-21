import { createStore, serialize, write } from "@store/index.js";
import viewGenerator from "./view.js"
import { SSRParts } from "../../../helpers/ssrApp.js";
import { clickCount } from "../state.js";
import { tokenMap } from "./tokenMap.js";
import { createStringRenderer } from "@server/index.js";

const storeA = createStore("store-a")
storeA.dispatch(write(clickCount, 4))

const storeB = createStore("store-b")
storeB.dispatch(write(clickCount, 2))

const renderToString = createStringRenderer(viewGenerator)

export default function (): SSRParts {
  return {
    html: `
<div>
  <div id="fragment-a">${renderToString(storeA)}</div>
  <div id="fragment-b">${renderToString(storeB)}</div>
</div>`,
    serializedStore: `
${serialize(storeA, tokenMap)}
${serialize(storeB, tokenMap)}`
  }
}
