import { runListener, StateBatch } from "../../tokenRegistry.js";
import { NativeEffectList } from "./nativeEffectList.js";
import { Publisher } from "./publisher.js";

export class BatchPublisher implements StateBatch {
  private publishers: Set<Publisher<any>> = new Set()

  add(publisher: Publisher<any>): void {
    this.publishers.add(publisher)
  }

  publish(): void {
    const effects = new NativeEffectList()
    for (const publisher of this.publishers) {
      publisher.notifyListeners(effects)
    }
    for (const publisher of this.publishers) {
      publisher.runListeners()
    }
    for (const subscriber of effects) {
      if (subscriber.parent === true) {
        runListener(subscriber)
      }
    }
    this.publishers.clear()
  }
}