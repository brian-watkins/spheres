import { GetState, State, StoreMessage } from "../../store/index.js";
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
  TEMPLATE = 18
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
  // key?: VirtualNodeKey
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

export interface TemplateNode {
  type: NodeType.TEMPLATE
  template: VirtualTemplate<any>
  args: any
  key?: VirtualNodeKey
  node: Node | undefined
}

export type VirtualNode = TextNode | StatefulTextNode | ElementNode | StatefulNode | BlockNode | TemplateNode

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

export function setEventHandler(config: VirtualNodeConfig, event: string, handler: (evt: Event) => StoreMessage<any, any>) {
  if (!config.on) { config.on = {} }

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

export class VirtualTemplate<T> {
  protected args!: T
  virtualNode!: VirtualNode

  setArgs(args: T) {
    this.args = args
  }

  useWithArgs<S>(generator: (get: GetState) => S): (get: GetState, args: T) => S {
    return (get, args) => {
      this.args = args
      return generator(get)
    }
  }
}

export function makeTemplate(template: VirtualTemplate<any>, args: any, key?: VirtualNodeKey): TemplateNode {
  return {
    type: NodeType.TEMPLATE,
    template,
    args: args,
    key,
    node: undefined
  }
}