import { dispatchMessage, StoreMessage } from "../../message.js"
import { StateBatch, TokenRegistry } from "../../tokenRegistry.js"
import { Writable } from "./writable.js"

export interface UpdateResult<T> {
  value: T
  message?: StoreMessage
}

export class MessageWriter<T, M> extends Writable<T, M> {
  constructor(private registry: TokenRegistry, initialValue: T, private update: ((message: M, current: T) => UpdateResult<T>)) {
    super(initialValue)
  }

  protected apply(message: M, batch?: StateBatch): void {
    const result = this.update(message, this.getValue())
    this.publish(result.value, batch)
    if (result.message !== undefined) {
      dispatchMessage(this.registry, result.message, batch)
    }
  }
}