import { createStreamRenderer } from "@server/index"
import view from "./view"
import { createStore } from "@store/index"
import { StreamingSSRParts } from "server/helpers/ssrApp"
import { serializedTokens, Thing, things, thingValue } from "./state"
import { HTMLBuilder } from "@view/htmlElements"

const streamRenderer = createStreamRenderer(page, {
  stateManifest: serializedTokens,
  activationScripts: [
    "/behaviors/server/fixtures/ssrApp/streamingSync/activate.ts"
  ]
})

function page(root: HTMLBuilder) {
  root.html(el => {
    el.children
      .head(el => {
        el.children
          .link(el => {
            el.config
              .rel("icon")
              .href("data:,")
          })
      })
      .body(el => {
        el.children.subview(view)
      })
  })
}

const thingsServerState: Array<Thing> = [
  { name: "cows", color: "black and white" },
  { name: "wine", color: "red" },
  { name: "clouds", color: "dark gray" },
  { name: "paint", color: "pink" },
  { name: "camels", color: "brown" },
  { name: "fruit", color: "blue" }
]

const thingValueServerState = "tens of"

export default function (): StreamingSSRParts {
  const store = createStore({
    init: async (actions) => {
      actions.supply(things, thingsServerState)
      actions.supply(thingValue, thingValueServerState)
    }
  })

  return {
    stream: streamRenderer(store)
  }
}
