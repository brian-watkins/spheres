import { Meta, StateToken, Writer } from "@src/store"

export class TestWriter<T> implements Writer<T> {
  lastValueToWrite: T | undefined
  handler: ((value: T, get: <S, N>(state: StateToken<S, N>) => S, set: (value: Meta<T>) => void, waitFor: () => Promise<T>) => Promise<void>) | undefined
  resolveWith: ((value: T) => void) | undefined

  setHandler(handler: (value: T, get: <S, N>(state: StateToken<S, N>) => S, set: (value: Meta<T>) => void, waitFor: () => Promise<T>) => Promise<void>) {
    this.handler = handler
  }

  async write(value: T, get: <S, N>(state: StateToken<S, N>) => S, set: (value: Meta<T>) => void): Promise<void> {
    this.lastValueToWrite = value
    return this.handler?.(value, get, set, () => {
      return new Promise((resolve) => {
        this.resolveWith = resolve
      })
    })
  }
}
