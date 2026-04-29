import { didCreateToken } from "./stateRecorder.js";
import { GetState, StateReader, StateToken, TokenRegistry, createStateHandler, getStateHandler, initListener } from "../tokenRegistry.js";
import { DerivedStateReader } from "./handler/derivedReader.js";

export interface DerivedStateInitializer<T> {
  query: (get: GetState) => T
  name?: string
}

export function derived<T>(initializer: DerivedStateInitializer<T> | ((get: GetState) => T)): DerivedState<T> {
  const token = typeof initializer === "function" ?
    new DerivedState(undefined, initializer) :
    new DerivedState(initializer.name, initializer.query)
  didCreateToken(token)
  return token
}

export class DerivedState<T> implements StateToken<T> {
  constructor(readonly name: string | undefined, private derivation: (get: GetState) => T) { }

  [getStateHandler](registry: TokenRegistry): StateReader<T> {
    return registry.getState(this)
  }

  [createStateHandler](registry: TokenRegistry): StateReader<T> {
    const reader = new DerivedStateReader(registry, this.derivation)
    initListener(registry, reader)
    return reader
  }

  toString() {
    return this.name ?? "DerivedState"
  }
}