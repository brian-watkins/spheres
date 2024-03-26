import { Meta, ok } from "./meta.js"

export interface StateListener {
  update(): void
}

export class StateController<T, M = T> {
  private listeners: Set<StateListener> = new Set()
  private writer: ((value: M) => void) | undefined
  private onPublish: (() => void) | undefined
  private metaController: StateController<Meta<M, any>> | undefined

  constructor(private _value: T, private reducer: ((message: M, current: T) => T) | undefined) { }

  setWriter(writer: (value: M) => void) {
    this.writer = writer
  }

  setPublishHook(onPublish: () => void) {
    this.onPublish = onPublish
  }

  setMeta(controller: StateController<Meta<M, any>>) {
    this.metaController = controller
  }

  addListener(listener: StateListener) {
    this.listeners.add(listener)
  }

  removeListener(listener: StateListener) {
    this.listeners.delete(listener)
  }

  write(message: M) {
    if (this.writer === undefined) {
      this.update(message)
    } else {
      this.writer(message)
    }
  }

  update(message: M) {
    this.publish(this.nextValue(message))
    this.onPublish?.()
  }

  publish(value: T) {
    this.metaController?.publish(ok())

    if (Object.is(this._value, value)) return

    this._value = value

    for (const listener of this.listeners) {
      listener.update()
    }
  }

  private nextValue(message: M) {
    if (this.reducer === undefined) {
      return message as unknown as T
    } else {
      return this.reducer(message, this._value)
    }
  }

  get value(): T {
    return this._value
  }
}