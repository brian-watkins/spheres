import { createStore, serialize, write } from "@store/index.js";
import viewGenerator from "./view.js"
import { SSRParts } from "../../../helpers/ssrApp.js";
import { clickCount } from "../state.js";
import { createStringRenderer } from "@server/index.js";
import { serializedTokens } from "./tokenMap.js";

const storeA = createStore({ id: "store-a" })
storeA.dispatch(write(clickCount, 4))

const storeB = createStore({ id: "store-b" })
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
${serialize(storeA, serializedTokens)}
${serialize(storeB, serializedTokens)}`
  }
}
