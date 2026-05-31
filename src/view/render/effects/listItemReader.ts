import { Publisher } from "../../../store/state/handler/publisher.js";
import { StateReader, Subscriber } from "../../../store/tokenRegistry.js";
import { ListItem } from "../viewRenderer.js";

export class ListItemReader<T> implements ListItem<T>, StateReader<ListItem<T>> {
  indexPublisher: Publisher<number> | undefined
  private subscriber: Subscriber | undefined

  constructor(readonly data: T, private _index: number) {}

  get index(): number {
    if (this.indexPublisher === undefined) {
      this.indexPublisher = new Publisher(this._index)
    }
    if (this.subscriber !== undefined) {
      this.indexPublisher.addSubscriber(this.subscriber)
    }
    return this.indexPublisher.getValue()
  }

  getValue(): ListItem<T> {
    return this
  }

  addSubscriber(subscriber: Subscriber): void {
    this.subscriber = subscriber
  }

  removeSubscriber(): void { }

  updateIndex(index: number) {
    this._index = index
    this.indexPublisher?.publish(index)
  }
}