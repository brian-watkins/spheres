export type Reconciler<T> = (current: T, next: T) => T

export const useCurrent: Reconciler<any> = (current) => current

export const useNext: Reconciler<any> = (_, next) => next
