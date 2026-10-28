import {
  createSubscriber,
  getStateHandler,
  StateBatch,
  StateDerivation,
  StateListenerType,
  StateToken,
  StateWriter,
  Subscriber,
  TokenRegistry,
} from "../../tokenRegistry.js"
import { SubscriberSet } from "./subscriberSet.js"

export class OverlayStateHandler
  extends SubscriberSet
  implements StateWriter<any, any>, StateDerivation
{
  readonly type = StateListenerType.Derivation
  private subscriber: Subscriber
  private isSubscribed: boolean = false
  private parent: StateWriter<any, any>

  constructor(
    private registry: TokenRegistry,
    private parentToken: StateToken<any>,
  ) {
    super()
    this.parent = this.resolveParent()
    this.subscriber = createSubscriber(registry, this)
  }

  didDetach() {
    this.isSubscribed = false
  }

  addSubscriber(subscriber: Subscriber): void {
    if (!this.isSubscribed) {
      this.parent = this.resolveParent()
      this.parent.addSubscriber(this.subscriber)
      this.isSubscribed = true
    }
    super.addSubscriber(subscriber)
  }

  init(): void {}

  run(): void {
    this.runSubscribers()
    this.parent.addSubscriber(this.subscriber)
    this.isSubscribed = true
  }

  detach(): void {
    if (this.isSubscribed) {
      this.parent.removeSubscriber(this.subscriber)
      this.isSubscribed = false
    }
  }

  write(value: any, batch?: StateBatch) {
    this.parent.write(value, batch)
  }

  publish(value: any, batch?: StateBatch) {
    this.parent.publish(value, batch)
  }

  getValue() {
    if (!this.isSubscribed) {
      this.parent = this.resolveParent()
    }
    return this.parent.getValue()
  }

  private resolveParent(): StateWriter<any, any> {
    return this.parentToken[getStateHandler](this.registry) as StateWriter<any, any>
  }
}
