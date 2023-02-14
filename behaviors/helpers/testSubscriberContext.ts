import { Context } from "esbehavior";
import { State } from "../../src/state";
import { TestLoop } from "./testLoop";

export function testSubscriberContext<S>(): Context<TestSubscriberContext<S>> {
  return {
    init: () => new TestSubscriberContext<S>()
  }
}

export class TestSubscriberContext<S> extends TestLoop<S> {
  private subscribers: Map<string, Array<any>> = new Map()
  private unsubscribers: Map<string, () => void> = new Map()

  subscribeTo<T>(state: State<T>, name: string) {
    const unsubscribe = state.subscribe((updatedValue) => {
      const values = this.subscribers.get(name)
      if (values === undefined) {
        this.subscribers.set(name, [updatedValue])
      } else {
        values.push(updatedValue)
      }
    })

    this.unsubscribers.set(name, unsubscribe)
  }

  unsubscribe(name: string) {
    this.unsubscribers.get(name)?.()
  }

  valuesReceivedBy(name: string): Array<any> {
    return this.subscribers.get(name) ?? []
  }
}