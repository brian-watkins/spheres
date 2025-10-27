import { ImmutableStatePublisher, ListenerNode, StateTag, Subscriber } from "../../tokenRegistry.js"

export abstract class StateWriter<T, M = T> extends ImmutableStatePublisher<T> {
  protected oldValue: T | undefined

  constructor(protected currentValue: T) {
    super()
  }

  abstract write(value: M): void

  publish(value: T, tag?: string) {
    if (Object.is(this.currentValue, value)) return

    // this.currentValue = value

    // could pass old value and new value here
    this.update(value)
  }

  protected update(value: T | undefined, tags?: Array<StateTag>) {
    if (value !== undefined) {
      this.oldValue = this.currentValue
      this.currentValue = value
    }

    const userEffects: Array<ListenerNode> = []
    // not sure what we have todo user effects like this, why
    // not just track in the state publisher and run at the end of the list?
    this.notifyListeners(userEffects)

    console.log("Run listeners with tags", tags)
    this.runListeners(tags)

    this.runUserEffects(userEffects, tags)

    this.oldValue = undefined
  }

  getValue(): T {
    return this.currentValue
  }
}
