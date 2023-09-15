import { Meta, ok } from "./meta.js"

export class ContainerController<T, M = T> {
  private dependents: Set<((value: T) => void)> = new Set()
  private query: ((current: T, next: M) => M) | undefined
  private writer: ((value: M) => void) | undefined
  private metaController: ContainerController<Meta<M, any>> | undefined

  constructor(private _value: T, private reducer: ((message: M, current: T) => T) | undefined) { }

  setWriter(writer: (value: M) => void) {
    this.writer = writer
  }

  setMeta(controller: ContainerController<Meta<M, any>>) {
    this.metaController = controller
  }

  addDependent(notifier: (value: T) => void): () => void {
    this.dependents.add(notifier)

    return () => {
      this.dependents.delete(notifier)
    }
  }

  publishValue(value: M) {
    let updatedValue
    if (this.reducer === undefined) {
      updatedValue = value as unknown as T
    } else {
      updatedValue = this.reducer(value, this._value)
    }
   
    this.metaController?.publishValue(ok())

    if (Object.is(this._value, updatedValue)) return
   
    this._value = updatedValue
    for (const notify of this.dependents) {
      notify(this._value)
    }
  }

  writeValue(value: M) {
    if (this.writer === undefined) {
      this.publishValue(value)
    } else {
      this.writer(value)
    }
  }

  setQuery(query: (current: T, next: M) => M) {
    this.query = query
  }

  updateValue(value: M) {
    if (this.query === undefined) {
      this.writeValue(value)
    } else {
      this.writeValue(this.query(this._value, value))
    }
  }

  get value(): T {
    return this._value
  }
}