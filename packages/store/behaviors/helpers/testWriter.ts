import { Writer, WriterActions } from "@src/index.js"

export class TestWriter<T, M = T, E = unknown> implements Writer<T, M, E> {
  lastValueToWrite: M | undefined
  handler: ((value: M, actions: WriterActions<T, M, E>, waitFor: () => Promise<M>) => Promise<void>) | undefined
  resolveWith: ((value: M) => void) | undefined
  rejectWith: ((value: E) => void) | undefined

  setHandler(handler: (value: M, actions: WriterActions<T, M, E>, waitFor: () => Promise<M>) => Promise<void>) {
    this.handler = handler
  }

  async write(value: M, actions: WriterActions<T, M, E>): Promise<void> {
    this.lastValueToWrite = value
    return this.handler?.(value, actions, () => {
      return new Promise((resolve, reject) => {
        this.resolveWith = resolve
        this.rejectWith = reject
      })
    })
  }
}
