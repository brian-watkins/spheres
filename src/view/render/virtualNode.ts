import { container } from "../../store/container.js";
import { Container, GetState, ReactiveVariable, State, StoreMessage, Variable } from "../../store/store.js";
import { reactiveVariable, variable } from "../../store/variable.js";

export type Stateful<T> = (get: GetState) => T | undefined

export interface EffectHandle {
  unsubscribe(): void
}

export enum NodeType {
  TEXT = 3,
  ELEMENT = 1,
  STATEFUL_TEXT = 16,
  STATEFUL_LIST = 17,
  STATEFUL_SELECTOR = 18
}

export interface TextNode {
  type: NodeType.TEXT
  value: string
}

export interface StatefulTextNode {
  type: NodeType.STATEFUL_TEXT
  generator: Stateful<string>
}

export type VirtualNodeKey = string | number | State<any>

export interface ElementNode {
  type: NodeType.ELEMENT
  tag: string
  data: VirtualNodeConfig
  children: Array<VirtualNode>
}

export interface ViewSelector {
  select: (get: GetState) => boolean
  template: VirtualTemplate<any>
}

export interface StatefulSelectorNode {
  type: NodeType.STATEFUL_SELECTOR
  id?: string
  selectors: Array<ViewSelector>
}

export interface StatefulListNode {
  type: NodeType.STATEFUL_LIST
  id?: string
  template: VirtualListItemTemplate<any>
  query: (get: GetState) => Array<any>
}

export type VirtualNode = TextNode | StatefulTextNode | ElementNode | StatefulSelectorNode | StatefulListNode

export interface StatefulValue<T> {
  generator: Stateful<T>
  effect?: EffectHandle
}

export type StoreEventHandler<T> = (evt: Event) => StoreMessage<T>

export interface VirtualNodeConfig {
  props?: Record<string, any>
  statefulProps?: Record<string, StatefulValue<any>>
  attrs: Record<string, string>
  statefulAttrs?: Record<string, StatefulValue<string>>
  namespace?: string
  on?: { [index: string]: StoreEventHandler<any> }
  key?: VirtualNodeKey
}

export interface StoreContext {
  generator: (get: GetState) => VirtualNode
}

export function virtualNodeConfig(): VirtualNodeConfig {
  return {
    attrs: {}
  }
}

export function setNamespace(config: VirtualNodeConfig, namespace: string) {
  config.namespace = namespace
}

export function addProperty<T>(config: VirtualNodeConfig, name: string, value: T) {
  if (!config.props) { config.props = {} }
  config.props[name] = value
}

export function addStatefulProperty<T>(config: VirtualNodeConfig, name: string, generator: Stateful<T>) {
  if (!config.statefulProps) { config.statefulProps = {} }
  config.statefulProps[name] = {
    generator
  }
}

export function addAttribute(config: VirtualNodeConfig, name: string, value: string) {
  config.attrs[name] = value
}

export function addStatefulAttribute(config: VirtualNodeConfig, name: string, generator: Stateful<string>) {
  if (!config.statefulAttrs) { config.statefulAttrs = {} }
  config.statefulAttrs[name] = {
    generator
  }
}

export function setEventHandler(config: VirtualNodeConfig, event: string, handler: StoreEventHandler<any>) {
  if (!config.on) {
    config.on = {}
  }

  config.on[event] = handler
}

export function makeStatefulSelector(selectors: Array<ViewSelector>): StatefulSelectorNode {
  return {
    type: NodeType.STATEFUL_SELECTOR,
    selectors
  }
}

export function makeVirtualElement(tag: string, config: VirtualNodeConfig, children: Array<VirtualNode>): ElementNode {
  const element: ElementNode = {
    type: NodeType.ELEMENT,
    tag,
    data: config,
    children,
  }

  return element
}

export function makeVirtualTextNode(text: string): TextNode {
  return {
    type: NodeType.TEXT,
    value: text,
  }
}

export function makeStatefulTextNode(generator: Stateful<string>): StatefulTextNode {
  return {
    type: NodeType.STATEFUL_TEXT,
    generator,
  }
}

export abstract class VirtualTemplate<T> {
  private _vnode!: VirtualNode

  protected setVirtualNode(vnode: VirtualNode) {
    switch (vnode.type) {
      case NodeType.ELEMENT:
        addAttribute(vnode.data, "data-spheres-template", "")
    }
    this._vnode = vnode
  }

  get virtualNode(): VirtualNode {
    return this._vnode
  }

  abstract setArgs(args: T): void
}

export interface VirtualListItemTemplateArgs<T> {
  item: T
  index?: Container<number>
}

export class VirtualListItemTemplate<T> extends VirtualTemplate<VirtualListItemTemplateArgs<T>> {
  protected itemToken: Variable<T | undefined> = variable({ initialValue: undefined })
  protected indexToken: ReactiveVariable<number> = reactiveVariable({ initialValue: container({ initialValue: -1 }) })
  public usesIndex = true

  setArgs(args: any): void {
    if (this.usesIndex) {
      this.itemToken.assignValue(args.item)
      this.indexToken.assignState(args.index!)
    } else {
      this.itemToken.assignValue(args)
    }
  }
}

export function makeZoneList<T>(virtualTemplate: VirtualListItemTemplate<T>, argList: (get: GetState) => Array<T>): StatefulListNode {
  return {
    type: NodeType.STATEFUL_LIST,
    template: virtualTemplate,
    query: argList,
  }
}
