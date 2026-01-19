import { StateReader } from "../../tokenRegistry.js";

export class ConstantReader<T> implements StateReader<T> {
  constructor(private value: T) { }
  
  getValue(): T {
    return this.value
  }

  addSubscriber(): void { }
  removeSubscriber(): void { }
}