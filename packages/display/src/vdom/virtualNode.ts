import { GetState, State, StoreMessage } from "@spheres/store";
import { EventHandler } from "./eventHandler.js";

export type Stateful<T, P = undefined> = (get: GetState, props: P) => T | undefined

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
  generator: Stateful<string, any>
  node: Node | undefined
}

export type VirtualNodeKey = string | number | State<any>

export interface ElementNode {
  type: NodeType.ELEMENT
  tag: string
  data: VirtualNodeConfig
  children: Array<VirtualNode>
  node: Element | undefined
  key?: VirtualNodeKey
}

export interface StatefulNode {
  type: NodeType.STATEFUL
  key?: VirtualNodeKey
  generator: (get: GetState, context: any) => VirtualNode
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
  content: VirtualNode
  context: any
  node: Node | undefined
}

export type VirtualNode = TextNode | StatefulTextNode | ElementNode | StatefulNode | BlockNode | TemplateNode

export interface StatefulValue {
  generator: Stateful<string, any>
  effect?: EffectHandle
}

export interface VirtualNodeConfig {
  props?: Record<string, any>
  statefulProps?: Record<string, StatefulValue>
  attrs: Record<string, string>
  statefulAttrs?: Record<string, StatefulValue>
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

export function addNamespace(config: VirtualNodeConfig, namespace: string) {
  config.namespace = namespace
}

export function addProperty(config: VirtualNodeConfig, name: string, value: string) {
  if (!config.props) { config.props = {} }
  config.props[name] = value
}

export function addStatefulProperty(config: VirtualNodeConfig, name: string, generator: Stateful<string>) {
  if (!config.statefulProps) { config.statefulProps = {} }
  config.statefulProps[name] = {
    generator
  }
}

export function addAttribute(config: VirtualNodeConfig, name: string, value: string) {
  config.attrs[name] = value
}

export function setKey(config: VirtualNodeConfig, key: VirtualNodeKey) {
  config.key = key
}

export function addStatefulAttribute(config: VirtualNodeConfig, name: string, generator: Stateful<string>) {
  if (!config.statefulAttrs) { config.statefulAttrs = {} }
  config.statefulAttrs[name] = {
    generator
  }
}

export function setEventHandler(config: VirtualNodeConfig, event: string, handler: (evt: Event, context: any) => StoreMessage<any, any>) {
  if (!config.on) { config.on = {} }

  config.on[event] = new EventHandler(handler)
}

export function makeStatefulElement(config: VirtualNodeConfig, generator: (get: GetState, context: any) => VirtualNode, node?: Node): VirtualNode {
  const element: StatefulNode = {
    type: NodeType.STATEFUL,
    generator,
    node
  }

  if (config.key) {
    element.key = config.key
  }

  return element
}

export function makeBlockElement(config: VirtualNodeConfig, generator: () => VirtualNode, node?: Element): VirtualNode {
  const blockNode: BlockNode = {
    type: NodeType.BLOCK,
    generator,
    node
  }

  if (config.key) {
    blockNode.key = config.key
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

  if (config.key) {
    element.key = config.key
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

export function makeStatefulTextNode(generator: (get: GetState) => string, node?: Node): StatefulTextNode {
  return {
    type: NodeType.STATEFUL_TEXT,
    generator,
    node
  }
}

export function makeTemplate(content: VirtualNode, context: any): TemplateNode {
  return {
    type: NodeType.TEMPLATE,
    content,
    context,
    node: undefined
  }
}