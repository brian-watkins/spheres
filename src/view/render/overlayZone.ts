import { DOMEvent, Zone } from ".";
import { State, Store } from "../../store";
import { OverlayStore } from "../../store/store";
import { StoreEventHandler } from "./virtualNode";

export class OverlayZone implements Zone {
  readonly store: Store

  constructor(private rootZone: Zone, initialValues: Map<State<any>, any>) {
    this.store = new OverlayStore(this.rootZone.store, initialValues)
  }

  addEvent(location: DOMEvent["location"], elementId: string, eventType: string, handler: StoreEventHandler<any>): void {
    this.rootZone.addEvent(location, elementId, eventType, handler)
  }
}
