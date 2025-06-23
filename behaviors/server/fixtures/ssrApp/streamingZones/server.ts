import { createStreamRenderer, zone } from "spheres/server"
import { createStore, collection, supplied } from "spheres/store";
import { StreamingSSRParts } from "server/helpers/ssrApp";
import { count, counter } from "./counter";
import { page } from "./page";

export default function (): StreamingSSRParts {
  const zones = collection(() => {
    return supplied({ initialValue: createStore() })
  })
  
  const rootStream = createStreamRenderer(page, {
    zones: [
      zone(counter, {
        stateMap: { count },
        store: zones.get("one"),
        mountPoint: "[data-zone='one']",
        activationScripts: [
          "/behaviors/server/fixtures/ssrApp/streamingZones/activateOne.ts"
        ]
      }),
      zone(counter, {
        stateMap: { count },
        store: zones.get("two"),
        mountPoint: "[data-zone='two']",
        activationScripts: [
          "/behaviors/server/fixtures/ssrApp/streamingZones/activateTwo.ts"
        ]
      }),
    ]
  })

  const rootStore = createStore({
    async init(actions) {

      actions.supply(zones.get("one"), createStore({
        id: "store-one",
        async init(actions) {
          actions.pending(count, 0)

          return new Promise(resolve => {
            setTimeout(() => {
              actions.supply(count, 17)
              resolve()
            }, 200)
          })
        }
      }))

      actions.supply(zones.get("two"), createStore({
        id: "store-two",
        async init(actions) {
          actions.pending(count, 0)

          return new Promise(resolve => {
            setTimeout(() => {
              actions.supply(count, 21)
              resolve()
            }, 150)
          })
        }
      }))
    },

  })

  return {
    stream: rootStream(rootStore)
  }
}