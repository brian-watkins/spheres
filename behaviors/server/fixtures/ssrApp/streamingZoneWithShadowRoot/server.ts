import { createStreamRenderer, zone } from "@server/index.js"
import { createStore, supplied, Store } from "@store/index.js"
import { clicks, page, zoneView } from "./view"
import { StreamingSSRParts } from "../../../helpers/ssrApp"

export default function (): StreamingSSRParts {
  const zoneStore = supplied<Store>({ initialValue: createStore() })

  const rootStream = createStreamRenderer(page, {
    zones: [
      zone(zoneView, {
        stateManifest: { clicks },
        store: zoneStore,
        mountPoint: "[data-zone='shadow']",
        activationScripts: [
          "/behaviors/server/fixtures/ssrApp/streamingZoneWithShadowRoot/activate.ts",
        ],
      }),
    ],
  })

  const rootStore = createStore({
    async init(actions) {
      actions.supply(zoneStore, createStore({ id: "shadow-zone-store" }))
    },
  })

  return {
    stream: rootStream(rootStore),
  }
}
