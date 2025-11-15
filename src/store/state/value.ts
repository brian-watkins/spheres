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

  // Note this is only necessary if we want to allow values to be standalone state
  [getPublisher]() {
    return this
  }
}

// this is necessary if we want to drill into a State and subscribe to some
// value inside it without also subscribing to the surrounding state
export function valueAt<T, S>(state: State<T>, locator: (val: T) => Value<S>): WritableState<S> {
  return {
    [getPublisher](registry) {
      return registry.getState(state).getPublisherAt(locator)
    }
  }
}

// Alternative interface with getState function ...
// export function valueAtGet<S>(query: (get: GetState) => Value<S>): WritableState<S> {
//   return {
//     [getPublisher](registry) {
//       return runQuery(registry, query)
//     }
//   }
// }