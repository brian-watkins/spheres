import { runListener, StateBatch, Subscriber } from "../../tokenRegistry";
import { Publisher } from "./publisher";

export class BatchPublisher implements StateBatch {
  private publishers: Set<Publisher<any>> = new Set()

  add(publisher: Publisher<any>): void {
    this.publishers.add(publisher)
  }

  publish(): void {
    const userEffects: Array<Subscriber> = []
    for (const publisher of this.publishers) {
      publisher.notifyListeners(userEffects)
    }
    for (const publisher of this.publishers) {
      publisher.runListeners()
    }
    for (const subscriber of userEffects) {
      if (subscriber.parent === true) {
        runListener(subscriber)
      }
    }
    this.publishers.clear()
  }
}