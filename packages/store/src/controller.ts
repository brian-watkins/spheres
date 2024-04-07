
export interface StateListener {
  notify(): void
  update(hasChanged: boolean): void
}

export interface StateController<T> {
  addListener(listener: StateListener): void
  removeListener(listener: StateListener): void
  value: T
}

export interface ContainerController<T, M = T> extends StateController<T> {
  write(message: M): void
  accept(message: M): void
  publish(value: T): void
}

export class SimpleStateController<T> implements ContainerController<T> {
  private listeners: Set<StateListener> = new Set()

  constructor(private _value: T) { }

  addListener(listener: StateListener) {
    this.listeners.add(listener)
  }

  removeListener(listener: StateListener) {
    this.listeners.delete(listener)
  }

  write(value: any) {
    this.accept(value)
  }

  accept(value: any) {
    this.publish(value)
  }

  publish(value: T) {
    if (Object.is(this._value, value)) return

    this._value = value

    for (const listener of this.listeners) {
      listener.notify()
    }

    for (const listener of new Set(this.listeners)) {
      listener.update(true)
    }
  }

  get value(): T {
    return this._value
  }
}
