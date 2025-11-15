import { Subscribable, runListener, StateListenerType, StateListenerVersion, Subscriber } from "../../tokenRegistry.js"

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
    if (subscriber.listener.type === StateListenerType.Derivation) {
      const first = {
        subscriber,
        version: subscriber.version,
        next: this.head
      }
      this.head = first
    } else {
      const next = {
        subscriber,
        version: subscriber.version,
        next: undefined
      }
      this.tail!.next = next
      this.tail = next
    }
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

  notifyListeners(userEffects: Array<Subscriber>): void {
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
          listener.notifyListeners(userEffects)
          break
        case StateListenerType.UserEffect:
          userEffects.push(node.subscriber)
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
        node = node.next
        continue
      }

      if (node.subscriber.listener.type === StateListenerType.UserEffect) {
        node.subscriber.parent = true
        node = node.next
        continue
      }

      runListener(node.subscriber)
      node = node.next
    }
  }

  runUserEffects(subscribers: Array<Subscriber>) {
    for (const subscriber of subscribers) {
      if (subscriber.parent === true) {
        runListener(subscriber)
      }
    }
  }
}