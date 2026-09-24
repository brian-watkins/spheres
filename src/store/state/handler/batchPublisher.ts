import { StateBatch } from "../../tokenRegistry.js"
import { NativeEffectList } from "./nativeEffectList.js"
import { Publisher } from "./publisher.js"

export class BatchPublisher implements StateBatch {
  private publishers: Set<Publisher<any>> = new Set()
  private effects: NativeEffectList = new NativeEffectList()
  private open: boolean = true

  add(publisher: Publisher<any>): void {
    this.publishers.add(publisher)
  }

  isOpen(): boolean {
    return this.open
  }

  close() {
    this.open = false
  }

  apply(): void {
    for (const publisher of this.publishers) {
      publisher.prepareSubscribers(this.effects)
    }
    for (const publisher of this.publishers) {
      publisher.runSubscribers()
    }
    this.publishers.clear()
  }

  publish(): void {
    this.apply()

    for (const subscriber of this.effects) {
      subscriber.run()
    }

    this.effects = new NativeEffectList()
  }
}
