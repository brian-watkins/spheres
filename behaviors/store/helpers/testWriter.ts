import { Writer, WriterActions } from "@src/store"

export class TestWriter<T, M = T> implements Writer<T, M> {
  lastValueToWrite: M | undefined
  handler: ((value: M, actions: WriterActions<T, M>, waitFor: () => Promise<M>) => Promise<void>) | undefined
  resolveWith: ((value: M) => void) | undefined

  setHandler(handler: (value: M, actions: WriterActions<T, M>, waitFor: () => Promise<M>) => Promise<void>) {
    this.handler = handler
  }

  async write(value: M, actions: WriterActions<T, M>): Promise<void> {
    this.lastValueToWrite = value
    return this.handler?.(value, actions, () => {
      return new Promise((resolve) => {
        this.resolveWith = resolve
      })
    })
  }
}
