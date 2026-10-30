import { derived } from "./state/derived.js"
import { reconcileArray, useCurrent } from "./state/reconciler/index.js"
import { State } from "./tokenRegistry.js"

export function splitState<T>(
  listState: State<Array<T>>,
  key: (item: T) => string,
): State<Array<State<T>>> {
  return derived({
    query(get) {
      const items = get(listState)
      return items.map((item) => {
        const itemKey = key(item)
        return derived({
          name: itemKey,
          query: (get) => get(listState).find((item) => itemKey === key(item)) as T,
          reconciler: (current, next) => next ?? current,
        })
      })
    },
    reconciler: reconcileArray({
      key: (itemState) => itemState.name,
      itemReconciler: useCurrent,
    }),
  })
}
