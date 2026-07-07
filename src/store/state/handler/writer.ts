import { StateBatch } from "../../tokenRegistry.js"
import { Writable } from "./writable.js"

export class Writer<T> extends Writable<T, T> {
  protected apply(value: T, batch?: StateBatch) {
    this.publish(value, batch)
  }
}
