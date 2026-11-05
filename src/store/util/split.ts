import { derived } from "../state/derived.js"
import { reconcileArray, useCurrent } from "../state/reconciler/index.js"
import { State } from "../tokenRegistry.js"

export function split<T>(list: State<Array<T>>, key: (item: T) => string): State<Array<State<T>>> {
  const itemsByKey = derived((get) => {
    const items = new Map<string, T>()
    for (const item of get(list)) {
      items.set(key(item), item)
    }
    return items
  })

  return derived({
    query(get) {
      const items = get(list)
      return items.map((item) => {
        const itemKey = key(item)
        return derived({
          name: itemKey,
          query: (get) => get(itemsByKey).get(itemKey) as T,
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
