import { WritableState } from "../message.js";
import { getPublisher, State } from "../tokenRegistry.js";
import { ValueWriter } from "./publisher/valueWriter.js";

export function value<T>(initialValue: T): Value<T> {
  return new Value(initialValue)
}

export class Value<T> extends ValueWriter<T> {  
  constructor(value: T) {
    super(value)
  }

  [getPublisher]() {
    return this
  }
}

export function valueAt<T, S>(state: State<T>, locator: (val: T) => Value<S>): WritableState<S> {
  return {
    [getPublisher](registry) {
      return registry.getState(state).getPublisherAt(locator)
    }
  }
}