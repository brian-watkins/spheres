import { getStateHandler, State, StateWriter, TokenRegistry, WritableState } from "../tokenRegistry.js";
import { Writer } from "./handler/writer.js";

export function value<T>(initial: T): Value<T> {
  return new Value(initial)
}

export function valueAt<T, S>(state: State<T>, locator: (val: T) => Value<S>): WritableState<S> {
  return {
    [getStateHandler](registry: TokenRegistry): StateWriter<S> {
      return locator(state[getStateHandler](registry).getValue())
    }
  }
}

export class Value<T> extends Writer<T> implements State<T> {
  [getStateHandler](): StateWriter<T> {
    return this
  }
}