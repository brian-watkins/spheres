import { GetState } from "../../../store/index.js"
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "../fragmentHelpers.js"
import { activate, DOMTemplate, render, TemplateType } from "../domTemplate.js"
import { generateStateManager, StateEffect, StateListenerType, StateReader, StateWriter, StateHandler, TokenRegistry, State, StateToken } from "../../../store/tokenRegistry.js"
import { ListItemTemplateContext } from "../templateContext.js"
import { OverlayTokenRegistry } from "../../../store/registry/overlayTokenRegistry.js"
import { OverlayStateHandler } from "../../../store/state/handler/overlayStateHandler.js"
import { Container, clone } from "../../../store/state/container.js"
import { ListItemReader } from "./listItemReader.js"
import { ListItem } from "../viewRenderer.js"

class ExternalStateHandler extends OverlayStateHandler {
  next: ExternalStateHandler | undefined = undefined

  constructor(registry: TokenRegistry, parent: StateWriter<any, any>, readonly token: StateToken<unknown>) {
    super(registry, parent)
  }
}

class ItemState extends OverlayTokenRegistry {
  private registry: Map<StateToken<unknown>, StateReader<unknown>> | undefined = undefined
  private externalStateHead: ExternalStateHandler | undefined = undefined

  static newInstance(data: any, index: number, registry: TokenRegistry, context: ListItemTemplateContext<any>): ItemState {
    return new ItemState(
      registry,
      context.listItemDataToken,
      new ListItemReader(data, index),
      context.viewTokens
    )
  }

  private constructor(
    registry: TokenRegistry,
    private listItemDataToken: State<ListItem<any>>,
    private listItemDataReader: ListItemReader<any>,
    private viewTokens: Set<StateToken<unknown>>
  ) {
    super(registry)
  }

  getRegistry(): Map<StateToken<unknown>, StateReader<unknown>> {
    if (this.registry === undefined) {
      this.registry = new Map()
    }
    return this.registry
  }

  getState<S extends StateToken<unknown>>(token: S): StateHandler<S> {
    if (token === this.listItemDataToken) {
      return this.listItemDataReader as StateHandler<S>
    }

    if (this.viewTokens.has(token)) {
      const registry = this.getRegistry()
      let publisher = registry.get(token)
      if (publisher === undefined) {
        if (token instanceof Container) {
          const rootToken = token[clone]()
          const manager = generateStateManager(this, token)
          this.parentRegistry.setState(rootToken, manager)
          publisher = this.parentRegistry.getState(rootToken)
          registry.set(token, publisher)
        } else {
          publisher = generateStateManager(this, token) as StateReader<unknown>
          registry.set(token, publisher)
        }
      }
      return publisher as StateHandler<S>
    }

    for (let handler = this.externalStateHead; handler !== undefined; handler = handler.next) {
      if (handler.token === token) {
        return handler as StateHandler<S>
      }
    }

    const actualPublisher = this.parentRegistry.getState(token) as StateWriter<any, any>
    const overlayHandler = new ExternalStateHandler(this.parentRegistry, actualPublisher, token)
    overlayHandler.next = this.externalStateHead
    this.externalStateHead = overlayHandler

    return overlayHandler as StateHandler<S>
  }

  unsubscribeFromExternalState() {
    for (let handler = this.externalStateHead; handler !== undefined; handler = handler.next) {
      handler.detach()
    }
  }

  updateIndex(index: number) {
    this.listItemDataReader.updateIndex(index)
  }
}

class VirtualItem {
  prev: VirtualItem | undefined = undefined
  next: VirtualItem | undefined = undefined
  isDetached: boolean = false
  nextData: any | undefined = undefined
  itemToAppend: VirtualItem | undefined = undefined

  constructor(public state: ItemState, public key: any, public index: number, public node: Node, public firstNode: Node | undefined, public lastNode: Node | undefined) { }

  cloneSlot(): VirtualItem {
    const slot = new VirtualItem(this.state, this.key, this.index, this.node, this.firstNode, this.lastNode)
    slot.isDetached = this.isDetached
    return slot
  }

  updateIndex(index: number) {
    this.index = index
    this.state.updateIndex(index)
  }

  unsubscribeFromExternalState() {
    this.state.unsubscribeFromExternalState()
  }
}


export class ListEffect implements StateEffect {
  readonly type = StateListenerType.ViewEffect
  private parentNode!: Node
  private first: VirtualItem | undefined
  private itemCache: Map<any, VirtualItem> = new Map()
  private updates: Array<VirtualItem> = []

  constructor(
    private registry: TokenRegistry,
    private domTemplate: DOMTemplate,
    private query: (get: GetState) => Array<any>,
    private templateContext: ListItemTemplateContext<any>,
    private listStart: Node,
    private listEnd: Node,
  ) { }

  setVirtualList(first: VirtualItem | undefined) {
    this.first = first
  }

  init(get: GetState) {
    this.patch(this.query(get))
  }

  run(get: GetState) {
    if (!this.listStart.isConnected) {
      return
    }

    this.patch(this.query(get))
  }

  private patch(data: Array<any>) {
    if (data.length === 0) {
      if (this.first !== undefined) {
        this.removeAllAfter(this.first)
        this.first = undefined
      }
      return
    }

    this.parentNode = this.listStart.parentNode!

    this.first = this.updateFirst(data[0])

    this.updateRest(this.first, data)

    this.itemCache.clear()
    this.updates.length = 0
  }

  private updateFirst(firstData: any): VirtualItem {
    if (this.first === undefined) {
      const item = this.createItem(0, firstData)
      this.appendNode(item)
      return item
    }

    if (this.first.key === firstData) {
      return this.first
    }

    if (this.first.next?.key === firstData) {
      this.itemCache.set(this.first.key, this.first)
      this.removeNode(this.first)
      this.first.isDetached = true
      this.first = this.first.next
      this.first!.prev = undefined
      if (this.first !== undefined) {
        this.first.updateIndex(0)
      }

      return this.first!
    }

    this.first.nextData = firstData
    this.updates.push(this.first)
    this.itemCache.set(this.first.key, this.first)

    return this.first
  }

  private updateRest(first: VirtualItem, data: Array<any>) {
    let last = first
    for (let i = 1; i < data.length; i++) {
      last = this.updateItem(i, last, data[i])
      if (last.index !== i) {
        last.updateIndex(i)
      }
    }

    if (last?.next !== undefined) {
      this.removeAllAfter(last.next)
      last.next = undefined
    }

    this.updateChangedItems()
  }

  private updateItem(index: number, last: VirtualItem, data: any): VirtualItem {
    const current = last.next

    if (current === undefined) {
      const cached = this.itemCache.get(data)
      let next: VirtualItem
      if (cached !== undefined && cached.isDetached) {
        next = cached.cloneSlot()
        this.appendNode(next)
      } else if (cached !== undefined) {
        next = cached.cloneSlot()
        next.index = index
        next.itemToAppend = cached
        next.nextData = data
        this.updates.push(next)
      } else {
        next = this.createItem(index, data)
        this.appendNode(next)
      }

      last.next = next
      next.prev = last
      return next
    }

    if (data === current.key) {
      return current
    }

    if (data === current.next?.key) {
      this.itemCache.set(current.key, current)
      this.removeNode(current)
      current.isDetached = true
      last.next = current.next
      current.next!.prev = last
      return current.next!
    }

    current.nextData = data
    this.updates.push(current)
    this.itemCache.set(current.key, current)

    return current
  }

  private updateChangedItems() {
    for (const item of this.updates) {
      const data = item.nextData

      if (item.itemToAppend !== undefined) {
        const itemToMove = item.itemToAppend
        this.insertNode(item, itemToMove)
        this.replaceListItem(item, itemToMove)
        itemToMove.isDetached = false
        if (itemToMove.index !== item.index) {
          itemToMove.updateIndex(item.index)
        }

        continue
      }

      const cached = this.itemCache.get(data)

      if (cached !== undefined) {
        const itemToMove = cached.cloneSlot()
        if (itemToMove.isDetached) {
          if (item.isDetached) {
            this.insertNode(item, itemToMove)
            this.replaceListItem(item, itemToMove)
            item.isDetached = false
          } else {
            this.replaceNode(item, itemToMove)
            this.replaceListItem(item, itemToMove)
            item.isDetached = true
          }

          itemToMove.isDetached = false
        } else {
          this.replaceNode(item, itemToMove)
          this.replaceListItem(item, itemToMove)
          item.isDetached = true
          cached.isDetached = true
        }
        if (itemToMove.index !== item.index) {
          itemToMove.updateIndex(item.index)
        }
      } else {
        if (item.isDetached) {
          const next = this.createItem(item.index, data)
          this.insertNode(item, next)
          this.replaceListItem(item, next)
          item.unsubscribeFromExternalState()
          item.isDetached = false
        } else {
          const next = this.createItem(item.index, data)
          this.replaceNode(item, next)
          this.replaceListItem(item, next)
          item.unsubscribeFromExternalState()
        }
      }

      item.nextData = undefined
    }
  }

  private appendNode(item: VirtualItem): void {
    this.parentNode.insertBefore(item.node, this.listEnd)
  }

  private insertNode(item: VirtualItem, next: VirtualItem): void {
    // Seems like this cannot happen where item is the first in the list
    // so this should be ok to assume item.prev is not undefined
    const last = item.prev!
    if (this.domTemplate.isFragment) {
      this.parentNode.insertBefore(this.fragmentFor(next), last.lastNode!.nextSibling)
    } else {
      this.parentNode.insertBefore(next.node, last.node.nextSibling)
    }
  }

  private fragmentFor(item: VirtualItem): Node {
    if (item.node.hasChildNodes()) {
      // in this case the DocumentFragment has not been inserted
      // into the dom so it still has children
      return item.node
    } else {
      // in this case we extract the fragment elements from the DOM
      // and return them in a new DocumentFragment
      return this.detachFragment(item)
    }
  }

  private detachFragment(item: VirtualItem): DocumentFragment {
    const range = new Range()
    range.setStartBefore(item.firstNode!)
    range.setEndAfter(item.lastNode!)
    return range.extractContents()
  }

  private replaceNode(current: VirtualItem, next: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      this.parentNode.insertBefore(this.fragmentFor(next), current.firstNode!)
      current.node = this.detachFragment(current)
    } else {
      this.parentNode.replaceChild(next.node, current.node)
    }
  }

  private replaceListItem(current: VirtualItem, replacement: VirtualItem) {
    if (current.prev) {
      current.prev.next = replacement
    } else {
      this.first = replacement
    }
    replacement.prev = current.prev
    if (current.next) {
      current.next.prev = replacement
    }
    replacement.next = current.next
  }

  private removeNode(item: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      item.node = this.detachFragment(item)
    } else {
      this.parentNode.removeChild(item.node)
    }
    item.unsubscribeFromExternalState()
  }

  private removeAllAfter(start: VirtualItem) {
    if (start === undefined) return

    const range = new Range()
    range.setEndBefore(this.listEnd)

    if (this.domTemplate.isFragment) {
      range.setStartBefore(start.firstNode!)
    } else {
      range.setStartBefore(start.node)
    }

    range.deleteContents()

    let item: VirtualItem | undefined = start
    while (item !== undefined) {
      item.unsubscribeFromExternalState()
      item = item.next
    }
  }

  private createItem(index: number, data: any): VirtualItem {
    const state = ItemState.newInstance(data, index, this.registry, this.templateContext)

    const node = render(this.domTemplate, state)

    return new VirtualItem(
      state,
      data,
      index,
      node,
      this.domTemplate.isFragment ? node.firstChild! : undefined,
      this.domTemplate.isFragment ? node.lastChild! : undefined
    )
  }
}

export function activateList(registry: TokenRegistry, context: ListItemTemplateContext<any>, template: DOMTemplate, startNode: Node, endNode: Node, data: Array<any>) {
  let index = 0
  let existingNode: Node = startNode.nextSibling!
  let firstItem: VirtualItem | undefined
  let lastItem: VirtualItem | undefined
  while (existingNode !== endNode) {
    const [item, nextNode] = activateItem(registry, context, template, index, existingNode, data[index])
    if (index === 0) {
      firstItem = item
    } else {
      lastItem!.next = item
      item.prev = lastItem
    }
    lastItem = item
    index++
    existingNode = nextNode
  }
  return firstItem
}

function activateItem(registry: TokenRegistry, context: ListItemTemplateContext<any>, template: DOMTemplate, index: number, node: Node, data: any): [VirtualItem, Node] {
  const state = ItemState.newInstance(data, index, registry, context)
  activate(template, state, node)

  switch (template.type) {
    case TemplateType.List: {
      const item = new VirtualItem(state, data, index, document.createDocumentFragment(), node, findListEndNode(node, getListElementId(node)))
      return [item, item.lastNode!.nextSibling!]
    }
    case TemplateType.Select: {
      const item = new VirtualItem(state, data, index, document.createDocumentFragment(), node, findSwitchEndNode(node, getSwitchElementId(node)))
      return [item, item.lastNode!.nextSibling!]
    }
    default: {
      return [new VirtualItem(state, data, index, node, undefined, undefined), node.nextSibling!]
    }
  }
}
