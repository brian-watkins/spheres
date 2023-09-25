import { GetState, State, Stateful, StoreMessage } from "state-party";

export enum NodeType {
  TEXT = 3,
  ELEMENT = 1,
  STATEFUL = 15,
  REACTIVE_TEXT = 16,
  BLOCK = 17
}

export interface TextNode {
  type: NodeType.TEXT
  value: string
  node: Node | undefined
}

export interface ReactiveTextNode {
  type: NodeType.REACTIVE_TEXT
  generator: Stateful<string>
  node: Node | undefined
}

export type VirtualNodeKey = string | number | State<any>

export interface ElementNode {
  type: NodeType.ELEMENT
  is?: string
  tag: string
  data: VirtualNodeConfig
  children: Array<VirtualNode>
  node: Element | undefined
  key?: VirtualNodeKey
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
  generator: () => VirtualNode
  unsubscribe?: () => void
  node: Node | undefined
}

export type VirtualNode = TextNode | ReactiveTextNode | ElementNode | StatefulNode | BlockNode

declare type Listener = (ev: Event) => any;

export interface StatefulValue {
  generator: Stateful<string>
}

export interface VirtualNodeConfig {
  props?: Record<string, any>
  statefulProps?: Record<string, StatefulValue>
  attrs: Record<string, string>
  statefulAttrs?: Record<string, StatefulValue>
  on?: { [N in keyof HTMLElementEventMap]?: Listener }
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

export function setEventHandler<N extends keyof HTMLElementEventMap>(config: VirtualNodeConfig, event: N, handler: (evt: HTMLElementEventMap[N]) => StoreMessage<any, any>) {
  if (!config.on) { config.on = {} }

  config.on[event] = (evt: any) => {
    evt.target?.dispatchEvent(new CustomEvent("displayMessage", {
      bubbles: true,
      cancelable: true,
      detail: handler(evt)
    }))
  }
}

export function makeStatefulElement(config: VirtualNodeConfig, generator: (get: GetState) => VirtualNode, node?: Node): VirtualNode {
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
  const block: BlockNode = {
    type: NodeType.BLOCK,
    generator,
    node
  }

  if (config.key) {
    block.key = config.key
  }

  return block
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

  if (config.attrs.is) {
    element.is = config.attrs.is
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

export function makeReactiveTextNode(generator: (get: GetState) => string, node?: Node): ReactiveTextNode {
  return {
    type: NodeType.REACTIVE_TEXT,
    generator,
    node
  }
}