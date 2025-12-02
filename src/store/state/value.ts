import { getStateHandler, StateReference, StateWriter, TokenRegistry, WritableState } from "../tokenRegistry.js";
import { Writer } from "./handler/writer.js";

export function value<T>(initial: T): Value<T> {
  return new Value(initial)
}

export function valueAt<T, S>(state: StateReference<T>, locator: (val: T) => Value<S>): WritableState<S> {
  return {
    [getStateHandler](registry: TokenRegistry): StateWriter<S> {
      return locator(state[getStateHandler](registry).getValue())
    }
  }
}

export class Value<T> extends Writer<T> implements StateReference<T> {
  [getStateHandler](): StateWriter<T> {
    return this
  }
}