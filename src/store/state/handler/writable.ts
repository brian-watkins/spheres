import { StateBatch, StateWriter } from "../../tokenRegistry.js"
import { Publisher } from "./publisher.js"

export type WriteHandler<M> = (message: M) => void

export interface WritableTarget<T, M> {
  getValue(): T
  write(message: M): void
}

export abstract class Writable<T, M> extends Publisher<T> implements StateWriter<T, M> {
  private writeHandler: WriteHandler<M> | undefined

  protected abstract apply(message: M, batch?: StateBatch): void

  write(message: M, batch?: StateBatch): void {
    if (this.writeHandler !== undefined) {
      this.writeHandler(message)
    } else {
      this.apply(message, batch)
    }
  }

  onWrite(generator: (target: WritableTarget<T, M>) => WriteHandler<M>): void {
    const currentHandler = this.writeHandler ?? ((message) => this.apply(message))
    this.writeHandler = generator({
      write: (message) => { currentHandler(message) },
      getValue: () => this.getValue()
    })
  }
}