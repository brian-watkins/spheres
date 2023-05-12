export class ContainerController<T, M = T> {
  private subscribers: Set<((value: T) => void)> = new Set()
  private dependents: Set<((value: T) => void)> = new Set()
  private writer: (value: M) => void

  constructor(private _value: T, private update: (message: M, current: T) => T) {
    this.writer = (value) => this.updateValue(value)
  }

  setWriter(writer: (value: M) => void) {
    this.writer = writer
  }

  addDependent(notifier: (value: T) => void) {
    this.dependents.add(notifier)
  }

  addSubscriber(notify: (value: T) => void): () => void {
    notify(this._value)
    this.subscribers.add(notify)

    return () => {
      this.subscribers.delete(notify)
    }
  }

  updateValue(value: M) {
    this._value = this.update(value, this._value)
    this.dependents.forEach(notify => notify(this._value))
    this.subscribers.forEach(notify => notify(this._value))
  }

  writeValue(value: M) {
    this.writer(value)
  }

  get value(): T {
    return this._value
  }
}