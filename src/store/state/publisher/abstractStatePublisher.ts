import { listenerParent, listenerStore, listenerVersion, notifyListeners, reactiveState, StatePublisher, StateListener, TokenRegistry } from "../../tokenRegistry.js"

export abstract class AbstractStatePublisher<T> implements StatePublisher<T> {
  private listeners: Map<StateListener, number> = new Map()

  constructor(protected registry: TokenRegistry) { }
  
  abstract getValue(): T

  addListener(listener: StateListener) {
    this.listeners.set(listener, listener[listenerVersion]!)
  }

  removeListener(listener: StateListener) {
    this.listeners.delete(listener)
  }

  [notifyListeners]() {
    for (const [listener, version] of this.listeners) {
      if (version === listener[listenerVersion]) {
        listener[listenerParent] = this
        listener[notifyListeners]?.()
      } else {
        this.removeListener(listener)
      }
    }
  }

  protected runListeners() {
    for (const listener of this.listeners.keys()) {
      if (listener[listenerParent] === this) {
        listener[listenerVersion] = listener[listenerVersion]! + 1
        const registry = listener[listenerStore] ?? this.registry
        listener.run(reactiveState(registry, listener))
        listener[listenerParent] = undefined
      }
    }
  }
}
