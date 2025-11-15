import { StateWriter } from "../../tokenRegistry.js"
import { SubscriberSetPublisher } from "./subscriberSetPublisher.js"

export class Writer<T> extends SubscriberSetPublisher<T> implements StateWriter<T, T> {
  write(value: T) {
    this.publish(value)
  }
}
