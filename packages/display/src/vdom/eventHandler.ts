import { Store, StoreMessage } from "@spheres/store";

export class EventHandler implements EventListenerObject {
  private store: Store | undefined
  private context: any = undefined

  constructor(public handler: (evt: Event, context: any) => StoreMessage<any>) { }

  connect(store: Store) {
    this.store = store
  }

  handleEvent(evt: Event): void {
    this.store!.dispatch(this.handler(evt, this.context))
  }
}