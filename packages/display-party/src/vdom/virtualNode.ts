import { GetState, StoreMessage } from "state-party";

export enum NodeType {
  TEXT = 3,
  ELEMENT = 1,
  STATEFUL = 15,
  REACTIVE_TEXT = 16
}

export interface TextNode {
  type: NodeType.TEXT
  value: string
  node: Node | undefined
}

export interface ReactiveTextNode {
  type: NodeType.REACTIVE_TEXT
  generator: (get: GetState) => string
  node: Node | undefined
  unsubscribe?: () => void
}

export interface ElementNode {
  type: NodeType.ELEMENT
  is: string | undefined
  tag: string
  data: VirtualNodeConfig
  children: Array<VirtualNode>
  node: Node | undefined
  key: string | undefined
}

export interface StatefulNode {
  type: NodeType.STATEFUL
  key: string | undefined
  generator: (get: GetState) => VirtualNode
  node: Node | undefined
  unsubscribe?: () => void
}

export type VirtualNode = TextNode | ReactiveTextNode | ElementNode | StatefulNode

declare type Listener = (ev: Event) => any;

export interface VirtualNodeConfig {
  props: Record<string, any>
  attrs: Record<string, string>
  on: { [N in keyof HTMLElementEventMap]?: Listener }
  key?: string
}

export interface StoreContext {
  generator: (get: GetState) => VirtualNode
}

export function virtualNodeConfig(): VirtualNodeConfig {
  return {
    props: {},
    attrs: {},
    on: {}
  }
}

export function addProperty(config: VirtualNodeConfig, name: string, value: string) {
  config.props![name] = value
}

export function addAttribute(config: VirtualNodeConfig, name: string, value: string) {
  config.attrs![name] = value
}

export function setKey(config: VirtualNodeConfig, key: string) {
  config.key = key
}

export function addClasses(config: VirtualNodeConfig, classNames: Array<string>) {
  addAttribute(config, "class", classNames.join(" "))
}

export function setEventHandler<N extends keyof HTMLElementEventMap>(config: VirtualNodeConfig, event: N, handler: (evt: HTMLElementEventMap[N]) => StoreMessage<any, any>) {
  config.on = Object.assign(config.on, {
    [event]: (evt: HTMLElementEventMap[N]) => {
      evt.target?.dispatchEvent(new CustomEvent("displayMessage", {
        bubbles: true,
        cancelable: true,
        detail: handler(evt)
      }))
    }
  })
}

export function makeStatefulElement(config: VirtualNodeConfig, generator: (get: GetState) => VirtualNode, node?: Node): VirtualNode {
  return {
    type: NodeType.STATEFUL,
    key: config.key,
    generator,
    node
  }
}

export function makeVirtualElement(tag: string, config: VirtualNodeConfig, children: Array<VirtualNode>, node?: Node): ElementNode {
  return {
    type: NodeType.ELEMENT,
    tag: tag,
    is: config.attrs.is,
    data: config,
    children,
    key: config.key,
    node
  }
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