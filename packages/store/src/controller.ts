import { Meta, ok } from "./meta.js"

export interface StateListener {
  update(): void
}

export enum MessageStatus {
  Provided,
  Constrained,
  Written
}

export class StateController<T, M = T> {
  private listeners: Set<StateListener> = new Set()
  private query: ((current: T, next: M) => M) | undefined
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

  setQuery(query: (current: T, next: M) => M) {
    this.query = query
  }

  update(source: MessageStatus, message: M) {
    switch (source) {
      case MessageStatus.Provided: {
        if (this.query === undefined) {
          this.update(MessageStatus.Constrained, message)
        } else {
          this.update(MessageStatus.Constrained, this.query(this._value, message))
        }
        break
      }
      case MessageStatus.Constrained: {
        if (this.writer === undefined) {
          this.update(MessageStatus.Written, message)
        } else {
          this.writer(message)
        }
        break
      }
      case MessageStatus.Written: {
        this.publish(this.nextValue(message))
        this.onPublish?.()
        break
      }
    }
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