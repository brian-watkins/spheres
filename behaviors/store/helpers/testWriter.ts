import { Writer, WriterActions } from "@src/store"

export class TestWriter<T> implements Writer<T> {
  lastValueToWrite: T | undefined
  handler: ((value: T, actions: WriterActions<T, T>, waitFor: () => Promise<T>) => Promise<void>) | undefined
  resolveWith: ((value: T) => void) | undefined

  setHandler(handler: (value: T, actions: WriterActions<T, T>, waitFor: () => Promise<T>) => Promise<void>) {
    this.handler = handler
  }

  async write(value: T, actions: WriterActions<T, T>): Promise<void> {
    this.lastValueToWrite = value
    return this.handler?.(value, actions, () => {
      return new Promise((resolve) => {
        this.resolveWith = resolve
      })
    })
  }
}
