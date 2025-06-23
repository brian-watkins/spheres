import { createStore } from "@store/index.js";
import viewGenerator from "./view.js"
import { SSRParts } from "../../../helpers/ssrApp.js";
import { clickCount } from "../state.js";
import { createStringRenderer } from "@server/index.js";
import { serializedTokens } from "./tokenMap.js";
import { HTMLBuilder } from "@view/htmlElements.js";

const storeA = createStore({
  id: "store-a",
  async init(actions) {
    actions.supply(clickCount, 4)
  },
})

const storeB = createStore({
  id: "store-b",
  async init(actions) {
    actions.supply(clickCount, 2)
  },
})

const renderHTMLToString = createStringRenderer(viewGenerator, {
  stateMap: serializedTokens,
})

function page(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .div(el => {
        el.config
          .id("fragment-a")
          .innerHTML(renderHTMLToString(storeA))
      })
      .div(el => {
        el.config
          .id("fragment-b")
          .innerHTML(renderHTMLToString(storeB))
      })
  })
}

const rootRenderer = createStringRenderer(page, {
  activationScripts: [
    "/behaviors/server/fixtures/ssrApp/multipleStores/activate.ts"
  ]
})

export default function (): SSRParts {
  return {
    html: rootRenderer(createStore())
  }
}