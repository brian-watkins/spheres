import { GetState } from "../../../store/index.js"
import { Collection } from "../../../store/state/collection.js"
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "../fragmentHelpers.js"
import { activate, DOMTemplate, render, TemplateType } from "../domTemplate.js"
import { createStatePublisher, initListener, OverlayTokenRegistry, State, StateListener, StateListenerType, StateListenerVersion, StatePublisher, Token, TokenRegistry } from "../../../store/tokenRegistry.js"
import { ListItemTemplateContext } from "../templateContext.js"
import { StateWriter } from "../../../store/state/publisher/stateWriter.js"
import { DerivedStatePublisher } from "../../../store/state/derived.js"

class DerivedStateTrackingPublisher extends DerivedStatePublisher<any> {
  private listeners: Map<VirtualItem, Set<StateListener>> = new Map()
  private currentItem: VirtualItem | undefined

  partitionBy(item: VirtualItem) {
    this.currentItem = item
  }

  removeListenersFor(item: VirtualItem) {
    const listeners = this.listeners.get(item)
    for (const listener of listeners ?? []) {
      this.removeListener(listener)
    }
    this.listeners.delete(item)
  }

  addListener(listener: StateListener): void {
    // this.listeners.add(listener)
    if (this.currentItem !== undefined) {
      let itemListeners = this.listeners.get(this.currentItem)
      if (itemListeners === undefined) {
        itemListeners = new Set([listener])
        this.listeners.set(this.currentItem, itemListeners)
      } else {
        itemListeners.add(listener)
      }
    }
    super.addListener(listener)
  }
}

class VirtualItem extends OverlayTokenRegistry {
  public static externalState: Map<State<any>, StatePublisher<any>> = new Map()

  node!: Node
  firstNode: Node | undefined = undefined
  lastNode: Node | undefined = undefined
  isDetached: boolean = false
  prev: VirtualItem | undefined = undefined
  next: VirtualItem | undefined = undefined
  nextData: any | undefined = undefined
  nextUpdate: VirtualItem | undefined = undefined
  trackExternal: boolean = true

  static newInstance(data: any, index: number, registry: TokenRegistry, context: ListItemTemplateContext<any>): VirtualItem {
    const item = new VirtualItem(data, index, registry, context.itemToken, new StateWriter(data))

    if (context.usesIndex) {
      item.setIndexState(context.indexToken, index)
    }

    if (context.tokens !== undefined) {
      item.setUserTokens(context.tokens)
    }

    return item
  }

  private constructor(
    public key: any,
    public index: number,
    public registry: TokenRegistry,
    private itemToken: State<any>,
    private itemPublisher: StateWriter<any>
  ) { super(registry) }

  private tokenMap: Map<Token, StatePublisher<any>> | undefined
  private indexToken: State<number> | undefined
  private indexPublisher: StateWriter<number> | undefined

  setNode(node: Node, firstNode: Node | undefined, lastNode: Node | undefined) {
    this.node = node
    this.firstNode = firstNode
    this.lastNode = lastNode
  }

  clone(): VirtualItem {
    const clone = new VirtualItem(
      this.key,
      this.index,
      this.registry,
      this.itemToken,
      this.itemPublisher
    )

    clone.node = this.node
    clone.firstNode = this.firstNode
    clone.lastNode = this.lastNode
    clone.indexToken = this.indexToken
    clone.indexPublisher = this.indexPublisher
    clone.isDetached = this.isDetached
    clone.prev = this.prev
    clone.next = this.next

    return clone
  }

  willRemove() {
    // for external tokens
    // there could be several listeners (from effects in the template item)
    // we need to remove each listener 
    // but basically we need to know what the listeners are, then we could
    // remove them from the publisher in the external state map.
    for (const [_, trackingPublisher] of VirtualItem.externalState) {
      (trackingPublisher as DerivedStateTrackingPublisher).removeListenersFor(this)
    }
  }

  setIndexState(token: State<number>, value: number) {
    this.indexToken = token
    this.indexPublisher = new StateWriter(value)
  }

  setUserTokens(tokens: Array<State<any>>) {
    this.tokenMap = new Map()
    
    for (const token of tokens) {
      this.tokenMap.set(token, createStatePublisher(this, token))
    }
  }

  getState<C extends StatePublisher<any>>(token: State<any>): C {
    if (token === this.itemToken) {
      return this.itemPublisher as any
    }

    if (token === this.indexToken) {
      return this.indexPublisher as any
    }

    // return (this.tokenMap?.get(token) ?? super.getState(token)) as any
    return (this.tokenMap?.get(token) ?? this.getExternalState(token)) as C
  }

  private getExternalState(token: State<any>): StatePublisher<any> {
    // I guess if it's a collection we should just return super.getState?
    // Then VirtualItem.externalState just holds DerivedStateTrackingPublishers
    if (!this.trackExternal || token instanceof Collection) {
      return super.getState(token)
    }

    let publisher = VirtualItem.externalState.get(token) as DerivedStateTrackingPublisher
    if (publisher === undefined) {
      // This would track ALL listeners across all template instances
      let derivedPublisher = new DerivedStateTrackingPublisher(this.registry, get => get(token))
      initListener(derivedPublisher)
      publisher = derivedPublisher
      VirtualItem.externalState.set(token, publisher)
    }
    // so we have to set it to store listeners in a particular list for this item
    publisher.partitionBy(this)
    return publisher
  }

  updateItemData(data: any) {
    this.itemPublisher.publish(data)
  }

  updateIndex(index: number) {
    this.indexPublisher?.publish(index)
  }
}


export class ListEffect implements StateListener {
  readonly type = StateListenerType.SystemEffect
  private usesIndex: boolean
  private parentNode!: Node
  private first: VirtualItem | undefined
  private itemCache: Map<any, VirtualItem> = new Map()
  private firstUpdate: VirtualItem | undefined
  private lastUpdate: VirtualItem | undefined
  version?: StateListenerVersion = 0

  constructor(
    public registry: TokenRegistry,
    private domTemplate: DOMTemplate,
    private query: (get: GetState) => Array<any>,
    private templateContext: ListItemTemplateContext<any>,
    private listStart: Node,
    private listEnd: Node,
  ) {
    this.usesIndex = this.templateContext.usesIndex
  }

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
        // VirtualItem.unsubscribeFromExternalState()
        for (const [token, publisher] of VirtualItem.externalState) {
          this.registry.getState(token).removeListener(publisher as DerivedStatePublisher<any>)
        }
        VirtualItem.externalState.clear()
      }
      return
    }

    this.parentNode = this.listStart.parentNode!

    this.first = this.updateFirst(data[0])

    this.updateRest(this.first, data)

    this.itemCache.clear()
    this.firstUpdate = undefined
    this.lastUpdate = undefined
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
      // needs a test
      // this.first.willRemove()
      this.first.isDetached = true
      this.first = this.first.next
      this.first!.prev = undefined
      if (this.usesIndex && this.first !== undefined) {
        this.updateIndex(0, this.first)
      }

      return this.first!
    }

    this.firstUpdate = this.first
    this.firstUpdate.nextData = firstData
    this.lastUpdate = this.firstUpdate
    this.itemCache.set(this.first.key, this.first)

    return this.first
  }

  private updateRest(first: VirtualItem, data: Array<any>) {
    let last = first
    for (let i = 1; i < data.length; i++) {
      last = this.updateItem(i, last, data[i])
      if (this.usesIndex && last.index !== i) {
        this.updateIndex(i, last)
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
      const next = this.createItem(index, data)
      this.appendNode(next)
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
      current.willRemove()
      current.isDetached = true
      last.next = current.next
      current.next!.prev = last
      return current.next!
    }

    if (this.lastUpdate === undefined) {
      this.firstUpdate = current
      this.firstUpdate.nextData = data
      this.lastUpdate = this.firstUpdate
    } else {
      this.lastUpdate.nextUpdate = current
      current.nextData = data
      this.lastUpdate = current
    }
    this.itemCache.set(current.key, current)

    return current
  }

  private updateChangedItems() {
    let nextUpdate = this.firstUpdate
    while (nextUpdate !== undefined) {
      const data = nextUpdate.nextData
      const item = nextUpdate

      const cached = this.itemCache.get(data)

      if (cached !== undefined) {
        const itemToMove = cached.clone()
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
          if (this.domTemplate.isFragment) {
            this.itemCache.delete(item.key)
          }
          item.isDetached = true
          cached.isDetached = true
        }
        if (this.usesIndex && itemToMove.index !== item.index) {
          this.updateIndex(item.index, itemToMove)
        }
      } else {
        if (item.isDetached) {
          const next = this.createItem(item.index, data)
          this.insertNode(item, next)
          this.replaceListItem(item, next)
          item.isDetached = false
        } else {
          if (data.id !== undefined && data.id === item.key.id) {
            this.updateItemData(item, data)
          } else {
            const next = this.createItem(item.index, data)
            this.replaceNode(item, next)
            this.replaceListItem(item, next)
            if (next.prev === undefined) {
              this.first = next
            }
          }
        }
      }

      // somehow can we know which items have been replaced with new data
      // and thus removed from the list -- in that case we should call willRemove
      // on them ...

      nextUpdate = nextUpdate.nextUpdate
      item.nextData = undefined
      item.nextUpdate = undefined
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
      if (next.node.childNodes.length > 0) {
        this.parentNode.insertBefore(next.node, last.node.nextSibling)
      } else {
        const range = new Range()
        range.setStartBefore(next.firstNode!)
        range.setEndAfter(next.lastNode!)
        const frag = range.extractContents()
        this.parentNode.insertBefore(frag, last.node.nextSibling)
      }
    } else {
      this.parentNode.insertBefore(next.node, last.node.nextSibling)
    }
  }

  private replaceNode(current: VirtualItem, next: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      const range = new Range()
      range.setStartBefore(current.firstNode!)
      range.setEndAfter(current.lastNode!)
      range.deleteContents()
      if (next.node.childNodes.length > 0) {
        this.parentNode.insertBefore(next.node, current.next?.firstNode ?? this.listEnd)
      } else {
        const range = new Range()
        range.setStartBefore(next.firstNode!)
        range.setEndAfter(next.lastNode!)
        const frag = range.extractContents()
        this.parentNode.insertBefore(frag, current.next?.firstNode ?? this.listEnd)
      }
    } else {
      this.parentNode.replaceChild(next.node, current.node)
    }
  }

  private replaceListItem(current: VirtualItem, replacement: VirtualItem) {
    if (current.prev) {
      current.prev.next = replacement
    }
    replacement.prev = current.prev
    if (current.next) {
      current.next.prev = replacement
    }
    replacement.next = current.next
  }

  private removeNode(item: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      const range = new Range()
      range.setStartBefore(item.firstNode!)
      range.setEndAfter(item.lastNode!)
      range.deleteContents()
    } else {
      this.parentNode.removeChild(item.node)
    }
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
  }

  private updateItemData(item: VirtualItem, itemData: any): void {
    item.updateItemData(itemData)
    item.key = itemData
  }

  private updateIndex(index: number, item: VirtualItem): void {
    item.updateIndex(index)
    item.index = index
  }

  private createItem(index: number, data: any): VirtualItem {
    const item = VirtualItem.newInstance(data, index, this.registry, this.templateContext)

    const node = render(this.domTemplate, item)
    item.setNode(
      node,
      this.domTemplate.isFragment ? node.firstChild! : undefined,
      this.domTemplate.isFragment ? node.lastChild! : undefined
    )

    return item
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
  const virtualItem = VirtualItem.newInstance(data, index, registry, context)
  activate(template, virtualItem, node)

  switch (template.type) {
    case TemplateType.List: {
      virtualItem.firstNode = node
      virtualItem.lastNode = findListEndNode(node, getListElementId(node))
      return [virtualItem, virtualItem.lastNode!.nextSibling!]
    }
    case TemplateType.Select: {
      virtualItem.firstNode = node
      virtualItem.lastNode = findSwitchEndNode(node, getSwitchElementId(node))
      return [virtualItem, virtualItem.lastNode!.nextSibling!]
    }
    default: {
      virtualItem.node = node
      return [virtualItem, node.nextSibling!]
    }
  }
}
