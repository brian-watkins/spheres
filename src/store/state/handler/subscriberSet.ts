import { Subscribable, runListener, StateListenerType, StateListenerVersion, Subscriber, EffectList } from "../../tokenRegistry.js"

interface SubscriberNode {
  subscriber: Subscriber
  version: StateListenerVersion
  next: SubscriberNode | undefined
}

export class SubscriberSet implements Subscribable {
  private head: SubscriberNode | undefined
  private tail: SubscriberNode | undefined

  constructor() { }

  addSubscriber(subscriber: Subscriber): void {
    if (this.head === undefined) {
      this.head = {
        subscriber: subscriber,
        version: subscriber.version,
        next: undefined
      }
      this.tail = this.head
      return
    }
    const next = {
      subscriber,
      version: subscriber.version,
      next: undefined
    }
    this.tail!.next = next
    this.tail = next
  }

  removeSubscriber(subscriber: Subscriber) {
    let node = this.head
    let previous = undefined
    while (node !== undefined) {
      if (node.subscriber === subscriber) {
        this.removeFromList(previous, node)
      }
      previous = node
      node = node.next
    }
  }

  private removeFromList(previous: SubscriberNode | undefined, node: SubscriberNode) {
    if (previous === undefined) {
      this.head = node.next
      if (this.tail === node) {
        this.tail = this.head
      }
    } else {
      previous.next = node.next
      if (this.tail === node) {
        this.tail = previous
      }
    }
  }

  notifyListeners(effects: EffectList): void {
    let previous: SubscriberNode | undefined = undefined
    let node = this.head
    while (node !== undefined) {
      if (node.subscriber.version !== node.version) {
        this.removeFromList(previous, node)
        node = node.next
        continue
      }
      const listener = node.subscriber.listener
      switch (listener.type) {
        case StateListenerType.Derivation:
          listener.notifyListeners(effects)
          break
        case StateListenerType.ViewEffect:
          effects.addViewEffect(node.subscriber)
          break
        case StateListenerType.ElementEffect:
          effects.addElementEffect(node.subscriber)
          break
        case StateListenerType.UserEffect:
          effects.addUserEffect(node.subscriber)
          break
      }
      node.subscriber.parent = this

      previous = node
      node = node.next
    }
  }

  runListeners(): void {
    let node = this.head

    // Start a new list -- any listeners added while running the current listeners
    // will be added to the new list
    this.head = undefined
    this.tail = undefined

    while (node !== undefined) {
      if (node.subscriber.parent !== this) {
        node.subscriber.dirty = true
        node = node.next
        continue
      }

      if (node.subscriber.listener.type === StateListenerType.Derivation) {
        runListener(node.subscriber)
      } else {
        node.subscriber.parent = true
      }

      node = node.next
    }
  }

  runDirtyListeners(): void {
    let node = this.head
    while (node !== undefined) {
      if (node.subscriber.parent != this || node.subscriber.dirty === false) {
        node = node.next
        continue
      }

      if (node.subscriber.listener.type === StateListenerType.Derivation) {
        runListener(node.subscriber)
      } else {
        node.subscriber.parent = true
      }

      node = node.next
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