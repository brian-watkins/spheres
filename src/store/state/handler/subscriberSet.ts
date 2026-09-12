import { Subscribable, StateListenerVersion, Subscriber, EffectList } from "../../tokenRegistry.js"

export class SubscriberSet implements Subscribable {
  private subscribers: Map<Subscriber, StateListenerVersion> = new Map()

  constructor() { }

  addSubscriber(subscriber: Subscriber): void {
    this.subscribers.set(subscriber, subscriber.getVersion())
  }

  removeSubscriber(subscriber: Subscriber) {
    this.subscribers.delete(subscriber)
  }

  prepareSubscribers(effects: EffectList): void {
    for (const [subscriber, version] of this.subscribers) {
      if (subscriber.getVersion() !== version) {
        this.removeSubscriber(subscriber)
        continue
      }
      subscriber.prepareForUpdate(this, effects)
    }
  }

  runSubscribers(): void {
    const subs = this.subscribers.keys()

    // Start a new list -- any listeners added while running the current listeners
    // will be added to the new list
    this.subscribers = new Map()

    for (const subscriber of subs) {
      subscriber.dependencyUpdated(this)
    }
  }

  notifyStable(): void {
    for (const subscriber of this.subscribers.keys()) {
      subscriber.dependencyStable(this)
    }
  }

  runEffects(effects: EffectList) {
    for (const subscriber of effects) {
      subscriber.run()
    }
  }
}
