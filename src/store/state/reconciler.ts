export {
  type ItemKey,
  type ReconcileArrayOptions,
  reconcileArray
} from "./reconciler/reconcileArray.js"

export {
  type FieldReconcilers,
  reconcileObject
} from "./reconciler/reconcileObject.js"

export type Reconciler<T> = (current: T, next: T) => T

export const useCurrent: Reconciler<any> = (current) => current

export const useNext: Reconciler<any> = (_, next) => next
