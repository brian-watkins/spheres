export class ContainerController<T, M = T> {
  private dependents: Set<((value: T) => void)> = new Set()
  private query: (current: T, next: M) => M
  private writer: (value: M) => void

  constructor(private _value: T, private reducer: (message: M, current: T) => T) {
    this.writer = (value) => this.publishValue(value)
    this.query = (_, next) => next
  }

  setWriter(writer: (value: M) => void) {
    this.writer = writer
  }

  addDependent(notifier: (value: T) => void) {
    this.dependents.add(notifier)
  }

  addSubscriber(notify: (value: T) => void): () => void {
    notify(this._value)
    this.dependents.add(notify)

    return () => {
      this.dependents.delete(notify)
    }
  }

  publishValue(value: M) {
    const updatedValue = this.reducer(value, this._value)
   
    if (Object.is(this._value, updatedValue)) return
   
    this._value = updatedValue
    this.dependents.forEach(notify => notify(this._value))
  }

  writeValue(value: M) {
    this.writer(value)
  }

  setQuery(query: (current: T, next: M) => M) {
    this.query = query
  }

  updateValue(value: M) {
    this.writeValue(this.query(this._value, value))
  }

  get value(): T {
    return this._value
  }
}