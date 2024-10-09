import { Store } from "../../store/index.js"
import { IdentifierGenerator } from "./idGenerator.js"
import { StoreEventHandler, VirtualNode, VirtualTemplate } from "./virtualNode.js"

export type StringRenderer = (node: VirtualNode) => string

export interface DOMEvent {
  location: "element" | "template"
  handler: StoreEventHandler<any>
}


export interface Zone {
  readonly store: Store
  addEvent(location: DOMEvent["location"], elementId: string, eventType: string, handler: StoreEventHandler<any>): void
}

export interface RenderResult {
  root: Node
  unmount: () => void
}

export type DOMNodeRenderer = (zone: Zone, idGenerator: IdentifierGenerator, vnode: VirtualNode) => Node

export interface TemplateData {
  template: VirtualTemplate<any>
  args: any
}

export type TemplateNodeRenderer = (zone: Zone, idGenerator: IdentifierGenerator, templateData: TemplateData) => Node

export interface EffectTemplate {
  attach(zone: Zone, root: Node, context: any): void
}

export interface DOMTemplate {
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