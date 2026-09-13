import { createSubscriber, GetState, StateDerivation, StateListenerType, StateWriter, Subscriber, TokenRegistry } from "../../tokenRegistry.js"
import { SubscriberSet } from "./subscriberSet.js"

export class GuardingStateHandler extends SubscriberSet implements StateWriter<any, any>, StateDerivation {
  readonly type = StateListenerType.Derivation
  private subscriber: Subscriber
  private isSubscribed: boolean = false

  constructor(
    registry: TokenRegistry,
    private parent: StateWriter<any, any>,
    private predicate: (get: GetState) => boolean
  ) {
    super()
    this.subscriber = createSubscriber(registry, this)
  }

  addSubscriber(subscriber: Subscriber): void {
    if (!this.isSubscribed) {
      this.predicate(this.subscriber.generateGetState())
      this.parent.addSubscriber(this.subscriber)
      this.isSubscribed = true
    }
    super.addSubscriber(subscriber)
  }

  init(): void { }

  run(get: GetState): void {
    if (this.predicate(get)) {
      this.runSubscribers()
    }
    this.parent.addSubscriber(this.subscriber)
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
