import { createSubscriber, StateDerivation, StateListenerType, StateWriter, Subscriber, TokenRegistry } from "../../tokenRegistry.js"
import { SubscriberSet } from "./subscriberSet.js"

export class OverlayStateHandler extends SubscriberSet implements StateWriter<any, any>, StateDerivation {
  readonly type = StateListenerType.Derivation
  private subscriber: Subscriber
  private isSubscribed: boolean = false

  constructor(registry: TokenRegistry, private parent: StateWriter<any, any>) {
    super()
    this.subscriber = createSubscriber(registry, this)
  }

  addSubscriber(subscriber: Subscriber): void {
    if (!this.isSubscribed) {
      this.parent.addSubscriber(this.subscriber)
      this.isSubscribed = true
    }
    super.addSubscriber(subscriber)
  }

  init(): void { }

  run(): void {
    this.runListeners()
    this.parent.addSubscriber(this.subscriber)
    this.isSubscribed = true
  }

  detach(): void {
    if (this.isSubscribed) {
      this.parent.removeSubscriber(this.subscriber)
      this.isSubscribed = false
    }
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
