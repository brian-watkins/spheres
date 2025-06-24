import { createStreamRenderer } from "@server/index"
import view from "./view"
import { createStore } from "@store/index"
import { StreamingSSRParts } from "server/helpers/ssrApp"
import { serializedTokens, things, thingValue } from "./state"
import { HTMLBuilder } from "@view/htmlElements"

const streamRenderer = createStreamRenderer(page, {
  stateMap: serializedTokens,
  activationScripts: [
    "/behaviors/server/fixtures/ssrApp/streamingError/activate.ts"
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

const thingValueServerState = "tens of"

export default function (): StreamingSSRParts {
  const store = createStore({
    init: async (actions) => {
      actions.pending(things, [])

      const thingPromise = new Promise<void>(resolve => {
        setTimeout(() => {
          actions.error(things, "failed", [])
          resolve()
        }, 200)
      })

      actions.pending(thingValue, "")

      const thingValuePromise = new Promise<void>(resolve => {
        setTimeout(() => {
          actions.supply(thingValue, thingValueServerState)
          resolve()
        }, 100)
      })

      await Promise.all([thingPromise, thingValuePromise])
    }
  })

  return {
    stream: streamRenderer(store)
  }
}
