import { Reconciler, useCurrent } from "../reconciler.js"

export type ItemKey = string | number

export interface ReconcileArrayOptions<T> {
  key?: (item: T) => ItemKey
  itemReconciler?: Reconciler<T>
}

export function reconcileArray<T>(options: ReconcileArrayOptions<T> = {}): Reconciler<Array<T>> {
  const { key, itemReconciler } = options
  const reconcileItem = itemReconciler ?? useCurrent

  return (current, next) => {
    if (isPositionallyIdentical(current, next)) {
      return current
    }

    if (key === undefined && itemReconciler === undefined) {
      return next
    }

    const selectCurrent = key === undefined ?
      selectByPosition(current) :
      selectByKey(key, current)

    let unchanged = current.length === next.length
    let nothingReused = true
    const elements: Array<T> = new Array(next.length)

    for (let i = 0; i < next.length; i++) {
      const nextItem = next[i]

      const currentItem = selectCurrent(nextItem, i)

      const element = currentItem === undefined ?
        nextItem :
        reconcileItem(currentItem, nextItem)

      elements[i] = element

      if (unchanged && !Object.is(element, current[i])) {
        unchanged = false
      }
      if (nothingReused && !Object.is(element, nextItem)) {
        nothingReused = false
      }
    }

    if (unchanged) return current
    if (nothingReused) return next

    return elements
  }
}

function isPositionallyIdentical<T>(current: Array<T>, next: Array<T>): boolean {
  if (current.length !== next.length) return false
  for (let i = 0; i < current.length; i++) {
    if (!Object.is(current[i], next[i])) return false
  }
  return true
}

type ItemSelector<T> = (item: T, index: number) => T | undefined

function selectByPosition<T>(current: Array<T>): ItemSelector<T> {
  return (_, index) => index < current.length ? current[index] : undefined
}

function selectByKey<T>(key: (item: T) => ItemKey, current: Array<T>): ItemSelector<T> {
  const buckets = new Map<ItemKey, Array<T>>()

  for (const item of current) {
    const itemKey = key(item)
    const bucket = buckets.get(itemKey)
    if (bucket === undefined) {
      buckets.set(itemKey, [item])
    } else {
      bucket.push(item)
    }
  }

  return (item) => {
    const itemKey = key(item)
    const bucket = buckets.get(itemKey)
    if (bucket === undefined) return undefined

    const counterpart = bucket.shift()
    if (bucket.length === 0) buckets.delete(itemKey)

    return counterpart
  }
}