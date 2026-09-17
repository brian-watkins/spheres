import { StateBatch, StateWriter } from "../../tokenRegistry.js"
import { Publisher } from "./publisher.js"

export type WriteHandler<M> = (message: M, batch?: StateBatch) => void

export interface WritableTarget<T, M> {
  getValue(): T
  write(message: M, batch?: StateBatch): void
}

export abstract class Writable<T, M> extends Publisher<T> implements StateWriter<T, M> {
  private writeHandler: WriteHandler<M> | undefined

  protected abstract apply(message: M, batch?: StateBatch): void

  write(message: M, batch?: StateBatch): void {
    if (this.writeHandler !== undefined) {
      this.writeHandler(message, batch)
    } else {
      this.apply(message, batch)
    }
  }

  onWrite(generator: (target: WritableTarget<T, M>) => WriteHandler<M>): void {
    const currentHandler = this.getCurrentHandler()
    this.writeHandler = generator({
      write: (message, batch) => { currentHandler(message, batch) },
      getValue: () => this.getValue()
    })
  }

  private getCurrentHandler(): WriteHandler<M> {
    return this.writeHandler ?? ((message, batch) => {
        this.apply(message, batch)
    })
  }
}
