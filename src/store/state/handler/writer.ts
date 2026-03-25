import { StateBatch, StateWriter } from "../../tokenRegistry.js"
import { Publisher } from "./publisher.js"

export class Writer<T> extends Publisher<T> implements StateWriter<T, T> {
  write(value: T, batch?: StateBatch) {
    this.publish(value, batch)
  }
}
