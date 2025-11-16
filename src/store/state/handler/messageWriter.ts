import { dispatchMessage, StoreMessage } from "../../message.js"
import { StateWriter, TokenRegistry } from "../../tokenRegistry.js"
import { Publisher } from "./publisher.js"

export interface UpdateResult<T> {
  value: T
  message?: StoreMessage
}

export class MessageWriter<T, M> extends Publisher<T> implements StateWriter<T, M> {
  constructor(private registry: TokenRegistry, initialValue: T, private update: ((message: M, current: T) => UpdateResult<T>)) {
    super(initialValue)
  }

  write(message: M): void {
    const result = this.update(message, this.getValue())
    this.publish(result.value)
    if (result.message !== undefined) {
      dispatchMessage(this.registry, result.message)
    }
  }
}