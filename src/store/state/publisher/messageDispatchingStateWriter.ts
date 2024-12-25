import { dispatchMessage, StoreMessage } from "../../message.js"
import { StateWriter } from "./stateWriter.js"
import { TokenRegistry } from "../../tokenRegistry.js"

export interface UpdateResult<T> {
  value: T
  message?: StoreMessage<any>
}

export class MessageDispatchingStateWriter<T, M> extends StateWriter<T> {
  constructor(private registry: TokenRegistry, initialValue: T, private update: ((message: M, current: T) => UpdateResult<T>)) {
    super(initialValue)
  }

  accept(message: M): void {
    const result = this.update(message, this.getValue())
    this.publish(result.value)
    if (result.message !== undefined) {
      dispatchMessage(this.registry, result.message)
    }
  }
}