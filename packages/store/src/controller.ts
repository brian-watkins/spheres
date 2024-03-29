
export interface StateListener {
  update(): void
}

export interface StateController<T, M = T> {
  addListener(listener: StateListener): void
  removeListener(listener: StateListener): void
  write(message: M): void
  accept(message: M): void
  publish(value: T): void
  value: T
}

export class SimpleStateController<T> implements StateController<T> {
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
      listener.update()
    }
  }

  get value(): T {
    return this._value
  }
}
