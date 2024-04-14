import { Store, StoreMessage } from "../../store";

export class EventHandler implements EventListenerObject {
  private store: Store | undefined

  constructor(public handler: (evt: Event) => StoreMessage<any>) { }

  connect(store: Store) {
    this.store = store
  }

  handleEvent(evt: Event): void {
    this.store!.dispatch(this.handler(evt))
  }
}