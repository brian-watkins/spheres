import { StateWriter } from "../../tokenRegistry.js"
import { Publisher } from "./publisher.js"

export class Writer<T> extends Publisher<T> implements StateWriter<T, T> {
  write(value: T) {
    this.publish(value)
  }
}
