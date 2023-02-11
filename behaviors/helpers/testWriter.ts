import { Container, State, Writer, WriteValueMessage } from "../../src/state"

interface TestUnknown {
  type: "write-unknown"
}

interface TestPending<T> {
  type: "write-pending"
  value: T
}

interface TestOk<T> {
  type: "write-ok"
  value: T
}

export type TestWritable<T> = TestUnknown | TestPending<T> | TestOk<T>

export class TestWriter<T> implements Writer<TestWritable<T>> {
  lastValueToWrite: TestWritable<T> | undefined
  handler: ((value: TestWritable<T>, get: <S>(state: State<S>) => S, set: (value: TestWritable<T>) => void, waitFor: () => Promise<TestWritable<T>>) => Promise<void>) | undefined
  resolveWith: ((value: TestWritable<T>) => void) | undefined

  setHandler(handler: (value: TestWritable<T>, get: <S>(state: State<S>) => S, set: (value: TestWritable<T>) => void, waitFor: () => Promise<TestWritable<T>>) => Promise<void>) {
    this.handler = handler
  }

  async write(value: TestWritable<T>, get: <S>(state: State<S>) => S, set: (value: TestWritable<T>) => void): Promise<void> {
    this.lastValueToWrite = value
    return this.handler?.(value, get, set, () => {
      return new Promise((resolve) => {
        this.resolveWith = resolve
      })
    })
  }
}

export function testWriteMessage<T>(container: Container<TestWritable<T>>, value: TestWritable<T>): WriteValueMessage<TestWritable<T>> {
  return {
    type: "write",
    value,
    state: container
  }
}