import { getStateHandler, StateReader, StateReference } from "../tokenRegistry";

export class Constant<T> implements StateReader<T>, StateReference<T> {
  constructor(private value: T) { }
  
  [getStateHandler](): StateReader<T> {
    return this
  }
  
  getValue(): T {
    return this.value
  }

  addSubscriber(): void { }
  removeSubscriber(): void { }
}