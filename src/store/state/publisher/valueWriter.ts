import { StateWriter } from "./stateWriter"

export class ValueWriter<T> extends StateWriter<T, T> {
  write(value: T) {
    this.publish(value)
  }
}
