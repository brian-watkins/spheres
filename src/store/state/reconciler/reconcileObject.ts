import { Reconciler } from "../reconciler.js"

export type FieldReconcilers<T> = {
  [K in keyof T]?: Reconciler<T[K]>
}

export function reconcileObject<T extends object>(fields: FieldReconcilers<T> = {}): Reconciler<T> {
  return (current, next) => {
    if (Object.is(current, next)) {
      return current
    }

    const nextKeys = Object.keys(next) as Array<keyof T>

    let unchanged = nextKeys.length === Object.keys(current).length
    let nothingReused = true
    const reconciled: Partial<T> = {}

    for (const key of nextKeys) {
      const fieldReconciler = fields[key]
      const value = fieldReconciler === undefined ?
        next[key] :
        fieldReconciler(current[key], next[key])

      reconciled[key] = value

      if (unchanged && !Object.is(value, current[key])) {
        unchanged = false
      }
      if (nothingReused && !Object.is(value, next[key])) {
        nothingReused = false
      }
    }

    if (unchanged) return current
    if (nothingReused) return next

    return reconciled as T
  }
}