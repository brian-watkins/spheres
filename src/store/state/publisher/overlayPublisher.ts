import { createSubscriber, StateDerivation, StateListenerType, Subscriber, TokenRegistry } from "../../tokenRegistry.js"
import { LinkedListStatePublisher } from "./linkedListStatePublisher.js"
import { StateWriter } from "./stateWriter.js"

export class OverlayPublisher extends LinkedListStatePublisher<any> implements StateDerivation {
  readonly type = StateListenerType.Derivation
  private subscriber: Subscriber

  constructor(registry: TokenRegistry, private parent: StateWriter<any>) {
    super()
    this.subscriber = createSubscriber(registry, this)
  }

  init(): void {
    this.parent.addListener(this.subscriber)
  }

  run(): void {
    this.runListeners()
    this.parent.addListener(this.subscriber)
  }

  detach(): void {
    this.parent.removeListener(this.subscriber)
  }

  write(value: any) {
    this.parent.write(value)
  }

  publish(value: any) {
    this.parent.publish(value)
  }

  getValue() {
    return this.parent.getValue()
  }
}
