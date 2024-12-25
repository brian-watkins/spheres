import { Container, container } from "../../store/state/container.js";
import { StoreMessage } from "../../store/message.js";
import { Command, CommandController, createStatePublisher, GetState, State, StatePublisher, Token, TokenRegistry } from "../../store/tokenRegistry.js";
import { StateWriter } from "../../store/state/publisher/stateWriter.js";

export type Stateful<T> = (get: GetState) => T | undefined

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
  template: VirtualTemplate
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

export type StoreEventHandler<T> = (evt: Event) => StoreMessage<T>

export interface VirtualNodeConfig {
  props?: Record<string, any>
  statefulProps?: Record<string, Stateful<any>>
  attrs: Record<string, string>
  statefulAttrs?: Record<string, Stateful<string>>
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
  config.statefulProps[name] = generator
}

export function addAttribute(config: VirtualNodeConfig, name: string, value: string) {
  config.attrs[name] = value
}

export function addStatefulAttribute(config: VirtualNodeConfig, name: string, generator: Stateful<string>) {
  if (!config.statefulAttrs) { config.statefulAttrs = {} }
  config.statefulAttrs[name] = generator
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

export class VirtualTemplate {
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
}

export interface VirtualListItemTemplateArgs<T> {
  item: T
  index?: Container<number>
}

export class VirtualListItemTemplate<T> extends VirtualTemplate {
  protected itemToken = container<T | undefined>({ initialValue: undefined })
  private _indexToken: Container<number> | undefined = undefined
  public usesIndex = true
  private tokens: Array<State<any>> | undefined

  addToken(token: State<any>) {
    if (this.tokens === undefined) {
      this.tokens = []
    }
    this.tokens.push(token)
  }

  get indexToken(): Container<number> {
    if (this._indexToken === undefined) {
      this._indexToken = container({ name: "index-token", initialValue: -1 })
    }

    return this._indexToken
  }

  createOverlayRegistry(rootRegistry: TokenRegistry, itemData: any, index: number): ListItemOverlayTokenRegistry {
    const registry = new ListItemOverlayTokenRegistry(rootRegistry, this.itemToken, itemData)
    if (this.usesIndex) {
      registry.setIndexState(this.indexToken, index)
    }
    if (this.tokens !== undefined) {
      registry.setUserTokens(this.tokens)
    }
    return registry
  }
}

export class ListItemOverlayTokenRegistry implements TokenRegistry {
  private _tokenMap: Map<Token, StatePublisher<any>> | undefined
  private _itemPublisher: StateWriter<any>

  constructor(
    private rootRegistry: TokenRegistry,
    private item: State<any>,
    itemData: any
  ) {
    this._itemPublisher = createStatePublisher(this, item, itemData) as StateWriter<any>
  }

  set(): void { }

  registerState<T>(token: State<T>, initialState?: T): StatePublisher<T> {
    return createStatePublisher(this, token, initialState)
  }

  registerCommand(token: Command<any>): CommandController<any> {
    return this.rootRegistry.registerCommand(token)
  }

  private get tokenMap(): Map<Token, StatePublisher<any>> {
    if (this._tokenMap === undefined) {
      this._tokenMap = new Map()
    }
    return this._tokenMap
  }

  setIndexState(token: State<number>, value: number) {
    this.tokenMap.set(token, this.registerState(token, value))
  }

  setUserTokens(tokens: Array<State<any>>) {
    for (const token of tokens) {
      const controller = this.registerState(token)
      this.tokenMap.set(token, controller)
    }
  }

  get(token: Token): any {
    if (token === this.item) {
      return this._itemPublisher
    }
    return this._tokenMap?.get(token) ?? this.rootRegistry.get(token)
  }

  updateItemData(data: any) {
    this._itemPublisher.publish(data)
  }
}

export function makeZoneList<T>(virtualTemplate: VirtualListItemTemplate<T>, argList: (get: GetState) => Array<T>): StatefulListNode {
  return {
    type: NodeType.STATEFUL_LIST,
    template: virtualTemplate,
    query: argList,
  }
}
