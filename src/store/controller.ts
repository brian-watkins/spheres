
export interface StateListener {
  notify(version: number): boolean
  update(hasChanged: boolean): void
}

export interface StateController<T> {
  addListener(listener: StateListener, version: number): void
  removeListener(listener: StateListener): void
  value: T
}

export interface ContainerController<T, M = T> extends StateController<T> {
  write(message: M): void
  accept(message: M): void
  publish(value: T): void
}

export class SimpleStateController<T> implements ContainerController<T> {
  private listeners: Map<StateListener, number> = new Map()

  constructor(private _value: T) { }

  addListener(listener: StateListener, version: number) {
    this.listeners.set(listener, version)
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

    for (const [listener, version] of this.listeners) {
      const accepted = listener.notify(version)
      if (!accepted) {
        this.removeListener(listener)
      }
    }

    for (const listener of this.listeners.keys()) {
      listener.update(true)
    }
  }

  get value(): T {
    return this._value
  }
}
