import { createSubscriber, StateDerivation, StateListenerType, StatePublisher, Subscriber, TokenRegistry } from "../../tokenRegistry.js"
import { LinkedListStatePublisher } from "./linkedListStatePublisher.js"
import { StateWriter } from "./stateWriter.js"

export class OverlayPublisher extends LinkedListStatePublisher<any> implements StateDerivation {
  readonly type = StateListenerType.Derivation
  private subscriber: Subscriber
  private valuePublishers = new Map<any, OverlayPublisher>()

  constructor(private registry: TokenRegistry, private parent: StateWriter<any>) {
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
    this.valuePublishers.forEach((overlayPublisher) => {
      overlayPublisher.detach()
    })
    this.valuePublishers.clear()
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

  getPublisherAt<S extends StatePublisher<any>>(locator: (value: any) => S): S {
    const publisher = this.parent.getPublisherAt(locator) as unknown as StateWriter<any>

    let valuePublisher = this.valuePublishers.get(publisher)
    if (valuePublisher === undefined) {
      valuePublisher = new OverlayPublisher(this.registry, publisher)
      valuePublisher.init()
      this.valuePublishers.set(publisher, valuePublisher)
    }

    return valuePublisher as unknown as S
  }
}
