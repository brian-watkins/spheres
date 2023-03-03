import { Container, State, Writer, WriteValueMessage } from "@src/loop.js"

// interface TestUnknown {
//   type: "write-unknown"
// }

// interface TestPending<T> {
//   type: "write-pending"
//   value: T
// }

// interface TestOk<T> {
//   type: "write-ok"
//   value: T
// }

// export type TestWritable<T> = TestUnknown | TestPending<T> | TestOk<T>

export class TestWriter<T> implements Writer<T> {
  lastValueToWrite: T | undefined
  handler: ((value: T, get: <S>(state: State<S>) => S, set: (value: T) => void, waitFor: () => Promise<T>) => Promise<void>) | undefined
  resolveWith: ((value: T) => void) | undefined

  setHandler(handler: (value: T, get: <S>(state: State<S>) => S, set: (value: T) => void, waitFor: () => Promise<T>) => Promise<void>) {
    this.handler = handler
  }

  async write(value: T, get: <S>(state: State<S>) => S, set: (value: T) => void): Promise<void> {
    this.lastValueToWrite = value
    return this.handler?.(value, get, set, () => {
      return new Promise((resolve) => {
        this.resolveWith = resolve
      })
    })
  }
}

// export function testWriteMessage<T>(container: Container<T>, value: T): WriteValueMessage<T> {
//   return {
//     type: "write",
//     value,
//     container
//   }
// }