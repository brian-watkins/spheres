import { Subscribable, runListener, StateListenerType, StateListenerVersion, Subscriber, EffectList } from "../../tokenRegistry.js"

export class SubscriberSet implements Subscribable {
  private subscribers: Map<Subscriber, StateListenerVersion> = new Map()

  constructor() { }

  addSubscriber(subscriber: Subscriber): void {
    this.subscribers.set(subscriber, subscriber.version)
  }

  removeSubscriber(subscriber: Subscriber) {
    this.subscribers.delete(subscriber)
  }

  notifyListeners(effects: EffectList): void {
    for (const [subscriber, version] of this.subscribers) {
      if (subscriber.version !== version) {
        this.removeSubscriber(subscriber)
        continue
      }
      const listener = subscriber.listener
      switch (listener.type) {
        case StateListenerType.Derivation:
          listener.notifyListeners(effects)
          break
        case StateListenerType.ViewEffect:
          effects.addViewEffect(subscriber)
          break
        case StateListenerType.ElementEffect:
          effects.addElementEffect(subscriber)
          break
        case StateListenerType.UserEffect:
          effects.addUserEffect(subscriber)
          break
      }
      subscriber.parent = this
    }
  }

  runListeners(): void {
    const subs = this.subscribers.keys()

    // Start a new list -- any listeners added while running the current listeners
    // will be added to the new list
    this.subscribers = new Map()

    for (const subscriber of subs) {
      if (subscriber.parent !== this) {
        subscriber.dirty = true
        continue
      }

      if (subscriber.listener.type === StateListenerType.Derivation) {
        runListener(subscriber)
      } else {
        subscriber.parent = true
      }
    }
  }

  runDirtyListeners(): void {
    for (const subscriber of this.subscribers.keys()) {
      if (subscriber.parent != this || subscriber.dirty === false) {
        continue
      }

      if (subscriber.listener.type === StateListenerType.Derivation) {
        runListener(subscriber)
      } else {
        subscriber.parent = true
      }
    }
  }

  runEffects(effects: EffectList) {
    for (const subscriber of effects) {
      if (subscriber.parent === true) {
        runListener(subscriber)
      }
    }
  }
}