import { GetState, Store } from "../../store/index.js"
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
  statefulWrapper?: UseWithArgs<any, any>
}

export type UseWithArgs<T, S> = (generator: (get: GetState) => S) => (args: T) => (get: GetState) => S

export interface NodeReference {
  node: Node | undefined
}

export type TemplateNodeRenderer = (zone: Zone, idGenerator: IdentifierGenerator, statefulGenerator: UseWithArgs<any, any>, nodeReference: NodeReference, templateData: TemplateData) => Node

export interface EffectOptions {
  generator?: UseWithArgs<any, any>
  nodeReference?: NodeReference
}

export interface EffectTemplate {
  attach(zone: Zone, root: Node, context: any, options?: EffectOptions): void
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