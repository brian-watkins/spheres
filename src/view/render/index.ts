import { TokenRegistry } from "../../store/tokenRegistry.js"
import { IdSequence } from "./idSequence.js"
import { StoreEventHandler, VirtualNode, VirtualTemplate } from "./virtualNode.js"

export type StringRenderer = (node: VirtualNode) => string

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

export type GetDOMTemplate = (zone: Zone, idSequence: IdSequence, virtualTemplate: VirtualTemplate) => DOMTemplate

export interface EffectTemplate {
  attach(zone: Zone, registry: TokenRegistry, root: Node): void
}

export interface DOMTemplate {
  isFragment: boolean
  rootType: "element" | "list" | "select"
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