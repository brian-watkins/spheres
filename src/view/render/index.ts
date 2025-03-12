import { StoreMessage } from "../../store/message.js"
import { TokenRegistry } from "../../store/tokenRegistry.js"

export type StoreEventHandler<T> = (evt: Event) => StoreMessage<T>

export interface DOMEvent {
  location: "element" | "template"
  handler: StoreEventHandler<any>
}

export interface Zone {
  addEvent(location: DOMEvent["location"], elementId: string, eventType: string, handler: StoreEventHandler<any>): void
}

export interface RenderResult {
  unmount: () => void
}

export interface EffectTemplate {
  attach(zone: Zone, registry: TokenRegistry, root: Node): void
}

export enum TemplateType {
  List, Select, Other
}

export interface DOMTemplate {
  isFragment: boolean
  type: TemplateType
  element: HTMLTemplateElement
  effects: Array<EffectTemplate>
}

export const spheresTemplateData = Symbol("spheresTemplateData")

// NOTE: Following SolidJS and Svelte with this list ...
export const EventsToDelegate = new Set([
  "beforeinput",
  "click",
  "dblclick",
  "contextmenu",
  "focusin",
  "focusout",
  "change",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pointerdown",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "touchend",
  "touchmove",
  "touchstart"
])