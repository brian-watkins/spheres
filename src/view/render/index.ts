import { StoreMessage } from "../../store/message.js"

export type StoreEventHandler<T> = (evt: Event) => StoreMessage<T>

export enum DOMEventType {
  Element, Template
}

export interface DOMEvent {
  type: DOMEventType
  handler: StoreEventHandler<any>
}

export interface Zone {
  addEvent(type: DOMEventType, elementId: string, eventType: string, handler: StoreEventHandler<any>): void
}

export interface RenderResult {
  unmount: () => void
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