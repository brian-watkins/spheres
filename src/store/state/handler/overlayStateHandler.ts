import { createSubscriber, StateDerivation, StateListenerType, StateWriter, Subscriber, TokenRegistry } from "../../tokenRegistry.js"
import { SubscriberSet } from "./subscriberSet.js"

export class OverlayStateHandler extends SubscriberSet implements StateWriter<any, any>, StateDerivation {
  readonly type = StateListenerType.Derivation
  private subscriber: Subscriber

  constructor(registry: TokenRegistry, private parent: StateWriter<any, any>) {
    super()
    this.subscriber = createSubscriber(registry, this)
  }

  init(): void {
    this.parent.addSubscriber(this.subscriber)
  }

  run(): void {
    this.runListeners()
    this.parent.addSubscriber(this.subscriber)
  }

  detach(): void {
    this.parent.removeSubscriber(this.subscriber)
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
