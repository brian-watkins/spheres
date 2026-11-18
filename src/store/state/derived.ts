import { getTokenOrigin } from "./tokenOrigin.js"
import {
  GetState,
  State,
  StateReader,
  StateToken,
  TokenRegistry,
  TokenOrigin,
  createStateHandler,
  getStateHandler,
  initListener,
  tokenOrigin,
} from "../tokenRegistry.js"
import { DerivedStateReader } from "./handler/derivedReader.js"
import { Reconciler } from "./reconciler/reconciler.js"
import { StateRef } from "./stateRef.js"

export interface DerivedStateInitializer<T> {
  query: (get: GetState) => T
  reconciler?: Reconciler<T>
  name?: string
}

export function derived<T>(
  initializer: DerivedStateInitializer<T> | ((get: GetState) => T),
): DerivedState<T> {
  return typeof initializer === "function"
    ? new DerivedState(undefined, initializer, undefined)
    : new DerivedState(initializer.name, initializer.query, initializer.reconciler)
}

export class DerivedState<T> implements StateToken<T> {
  [tokenOrigin]: TokenOrigin | undefined = getTokenOrigin()

  constructor(
    readonly name: string | undefined,
    private derivation: (get: GetState) => T,
    private reconciler: Reconciler<T> | undefined,
  ) {}

  [getStateHandler](registry: TokenRegistry): StateReader<T> {
    const reader = registry.getState(this)
    reader.prepareForRead?.(registry)
    return reader
  }

  [createStateHandler](registry: TokenRegistry): StateReader<T> {
    const reader = new DerivedStateReader(this.derivation, this.reconciler, this[tokenOrigin])
    initListener(registry, reader)
    return reader
  }

  at<S extends State<any>>(locator: (value: T) => S): StateRef<S> {
    return new StateRef(this, locator)
  }

  toString() {
    return this.name ?? "DerivedState"
  }
}
