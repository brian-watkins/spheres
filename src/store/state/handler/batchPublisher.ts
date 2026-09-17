import { StateBatch } from "../../tokenRegistry.js";
import { NativeEffectList } from "./nativeEffectList.js";
import { Publisher } from "./publisher.js";

export class BatchPublisher implements StateBatch {
  private publishers: Set<Publisher<any>> = new Set()
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

  publish(): void {
    const effects = new NativeEffectList()
    for (const publisher of this.publishers) {
      publisher.prepareSubscribers(effects)
    }
    for (const publisher of this.publishers) {
      publisher.runSubscribers()
    }
    for (const subscriber of effects) {
      subscriber.run()
    }
    this.publishers.clear()
  }
}
