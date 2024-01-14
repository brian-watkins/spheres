import { Meta, ok } from "./meta.js"

export interface StateListener {
  update(): void
}

export class ContainerController<T, M = T> {
  private listeners: Set<StateListener> = new Set()
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

  addListener(listener: StateListener) {
    this.listeners.add(listener)
  }

  removeListener(listener: StateListener) {
    this.listeners.delete(listener)
  }

  generateNext(message: M) {
    let updatedValue
    if (this.reducer === undefined) {
      updatedValue = message as unknown as T
    } else {
      updatedValue = this.reducer(message, this._value)
    }

    this.publishValue(updatedValue)
  }

  publishValue(value: T) {
    this.metaController?.publishValue(ok())

    if (Object.is(this._value, value)) return
   
    this._value = value

    for (const listener of this.listeners) {
      listener.update()
    }
  }

  writeValue(value: M) {
    if (this.writer === undefined) {
      this.generateNext(value)
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