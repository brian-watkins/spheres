import { Container, container, GetState, reactiveVariable, ReactiveVariable, State, StoreMessage, variable, Variable } from "../../store/index.js";
import { EventHandler } from "./eventHandler.js";

export type Stateful<T> = (get: GetState) => T | undefined

export interface EffectHandle {
  unsubscribe(): void
}

export enum NodeType {
  TEXT = 3,
  ELEMENT = 1,
  STATEFUL = 15,
  STATEFUL_TEXT = 16,
  BLOCK = 17,
  TEMPLATE = 18,
  ZONE_LIST = 19,
}

export interface TextNode {
  type: NodeType.TEXT
  value: string
  node: Node | undefined
}

export interface StatefulTextNode {
  type: NodeType.STATEFUL_TEXT
  generator: Stateful<string>
  node: Node | undefined
}

export type VirtualNodeKey = string | number | State<any>

export interface ElementNode {
  type: NodeType.ELEMENT
  tag: string
  data: VirtualNodeConfig
  children: Array<VirtualNode>
  node: Element | undefined
}

export interface StatefulNode {
  type: NodeType.STATEFUL
  key?: VirtualNodeKey
  generator: (get: GetState) => VirtualNode
  node: Node | undefined
}

export interface BlockNode {
  type: NodeType.BLOCK
  key?: VirtualNodeKey
  generator?: () => VirtualNode
  node: Node | undefined
}

// This might should be a ZoneListItemNode ... since that's all it's used for I think
export interface TemplateNode {
  type: NodeType.TEMPLATE
  template: VirtualTemplate<any>
  // couldn't args be something more particular -- like { item: T, index: number }?
  args: any
  key?: VirtualNodeKey
  node: Node | undefined
}

export interface ZoneListNode {
  type: NodeType.ZONE_LIST
  id: string
  template: VirtualListItemTemplate<any>
  argList: (get: GetState) => Array<any>
  node: Node | undefined
}

export type VirtualNode = TextNode | StatefulTextNode | ElementNode | StatefulNode | BlockNode | TemplateNode | ZoneListNode

export interface StatefulValue<T> {
  generator: Stateful<T>
  effect?: EffectHandle
}

export interface VirtualNodeConfig {
  props?: Record<string, any>
  statefulProps?: Record<string, StatefulValue<any>>
  attrs: Record<string, string>
  statefulAttrs?: Record<string, StatefulValue<string>>
  namespace?: string
  on?: { [index: string]: EventHandler }
  eventId: string
  key?: VirtualNodeKey
}

export interface StoreContext {
  generator: (get: GetState) => VirtualNode
}

export function virtualNodeConfig(eventId: number = 0): VirtualNodeConfig {
  return {
    attrs: {},
    eventId: `${eventId}`
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

export function setEventHandler(config: VirtualNodeConfig, event: string, handler: (evt: Event) => StoreMessage<any, any>) {
  if (!config.on) {
    config.on = {}
  }

  config.on[event] = new EventHandler(handler)
}

export function makeStatefulElement(generator: (get: GetState) => VirtualNode, key: VirtualNodeKey | undefined, node?: Node): VirtualNode {
  const element: StatefulNode = {
    type: NodeType.STATEFUL,
    generator,
    key,
    node
  }

  return element
}

export function makeBlockElement(generator: () => VirtualNode, key: VirtualNodeKey | undefined, node?: Element): VirtualNode {
  const blockNode: BlockNode = {
    type: NodeType.BLOCK,
    generator,
    key,
    node
  }

  return blockNode
}

export function makeVirtualElement(tag: string, config: VirtualNodeConfig, children: Array<VirtualNode>, node?: Element): ElementNode {
  const element: ElementNode = {
    type: NodeType.ELEMENT,
    tag: tag,
    data: config,
    children,
    node
  }

  return element
}

export function makeVirtualTextNode(text: string, node?: Node): TextNode {
  return {
    type: NodeType.TEXT,
    value: text,
    node
  }
}

export function makeStatefulTextNode(generator: Stateful<string>, node?: Node): StatefulTextNode {
  return {
    type: NodeType.STATEFUL_TEXT,
    generator,
    node
  }
}

export type WithArgs<T> =
  <S>(generator: (args: T, get: GetState) => S) => (get: GetState) => S

export abstract class VirtualTemplate<T> {
  public virtualNode!: VirtualNode
  
  abstract setArgs(args: T): void

  useWithArgs<S>(generator: (get: GetState) => S): (get: GetState, args: T) => S {
    return (get, args) => {
      this.setArgs(args)
      return generator(get)
    } 
  }
}

export function makeTemplate<T>(template: VirtualTemplate<T>, args: T, key?: VirtualNodeKey): TemplateNode {
  return {
    type: NodeType.TEMPLATE,
    template,
    args: args,
    key,
    node: undefined
  }
}

export interface VirtualListItemTemplateArgs<T> {
  item: T
  index?: Container<number>
}

export class VirtualListItemTemplate<T> extends VirtualTemplate<VirtualListItemTemplateArgs<T>> {
  protected itemToken: Variable<T | undefined> = variable({ initialValue: undefined })
  protected indexToken: ReactiveVariable<number> = reactiveVariable({ initialValue: container({ initialValue: -1 }) })
  public usesIndex = true

  setArgs(args: VirtualListItemTemplateArgs<T>): void {
    this.itemToken.assignValue(args.item)
    if (args.index) {
      this.indexToken.assignState(args.index)
    }
  }
}

// Hmm ... any way to remove this?
let templateListId = 0

export function makeZoneList<T>(virtualTemplate: VirtualListItemTemplate<T>, argList: (get: GetState) => Array<T>): ZoneListNode {
  return {
    type: NodeType.ZONE_LIST,
    id: `${templateListId++}`,
    template: virtualTemplate,
    argList,
    node: undefined
  }
}