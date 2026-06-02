import { Value } from "../../../store/state/value.js";
import { GetState, StateReader } from "../../../store/tokenRegistry.js";
import { ListItem } from "../viewRenderer.js";

export class ListItemReader<T> implements ListItem<T>, StateReader<ListItem<T>> {
  indexPublisher: Value<number> | undefined
  public getState: GetState | undefined

  constructor(readonly data: T, private _index: number) {}

  get index(): number {
    if (this.indexPublisher === undefined) {
      this.indexPublisher = new Value(this._index)
    }
    return this.getState!(this.indexPublisher)
  }

  getValue(): ListItem<T> {
    return this
  }

  addSubscriber(): void { }

  removeSubscriber(): void { }

  updateIndex(index: number) {
    this._index = index
    this.indexPublisher?.publish(index)
  }
}