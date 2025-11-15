import { GetState } from "../../../store/index.js"
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "../fragmentHelpers.js"
import { activate, DOMTemplate, render, TemplateType } from "../domTemplate.js"
import { generateStateManager, State, StateEffect, StateListenerType, StatePublisher, StateReader, StateWriter, StateHandler, Token, TokenRegistry } from "../../../store/tokenRegistry.js"
import { ListItemTemplateContext } from "../templateContext.js"
import { OverlayTokenRegistry } from "../../../store/registry/overlayTokenRegistry.js"
import { OverlayPublisher } from "../../../store/state/publisher/overlayPublisher.js"
import { SubscriberSetPublisher } from "../../../store/state/publisher/subscriberSetPublisher.js"

class VirtualItem extends OverlayTokenRegistry {
  node!: Node
  firstNode: Node | undefined = undefined
  lastNode: Node | undefined = undefined
  isDetached: boolean = false
  prev: VirtualItem | undefined = undefined
  next: VirtualItem | undefined = undefined
  nextData: any | undefined = undefined
  nextUpdate: VirtualItem | undefined = undefined
  private registry: Map<Token, StateReader<any>> = new Map()

  static newInstance(data: any, index: number, registry: TokenRegistry, context: ListItemTemplateContext<any>): VirtualItem {
    const item = new VirtualItem(data, index, registry, context.itemToken, new SubscriberSetPublisher(data), context.viewTokens)

    if (context.usesIndex) {
      item.setIndexState(context.indexToken, index)
    }

    return item
  }

  private constructor(
    public key: any,
    public index: number,
    registry: TokenRegistry,
    private itemToken: State<any>,
    private itemPublisher: StatePublisher<any>,
    private viewTokens: Set<Token>
  ) { super(registry) }

  private indexToken: State<number> | undefined
  private indexPublisher: StatePublisher<number> | undefined

  setNode(node: Node, firstNode: Node | undefined, lastNode: Node | undefined) {
    this.node = node
    this.firstNode = firstNode
    this.lastNode = lastNode
  }

  clone(): VirtualItem {
    const clone = new VirtualItem(
      this.key,
      this.index,
      this.parentRegistry,
      this.itemToken,
      this.itemPublisher,
      this.viewTokens,
    )

    clone.setNode(this.node, this.firstNode, this.lastNode)
    clone.indexToken = this.indexToken
    clone.indexPublisher = this.indexPublisher
    clone.isDetached = this.isDetached
    clone.prev = this.prev
    clone.next = this.next

    return clone
  }

  setIndexState(token: State<number>, value: number) {
    this.indexToken = token
    this.indexPublisher = new SubscriberSetPublisher(value)
  }

  getState<S extends State<unknown>>(token: S): StateHandler<S> {
    if (token === this.itemToken) {
      return this.itemPublisher as any
    }

    if (token === this.indexToken) {
      return this.indexPublisher as any
    }

    let publisher = this.registry.get(token)
    if (publisher === undefined) {
      publisher = this.createPublisher(token)
      this.registry.set(token, publisher)
    }

    return publisher as StateHandler<S>
  }

  private createPublisher<S extends State<unknown>>(token: S): StateHandler<S> {
    if (this.viewTokens.has(token)) {
      return generateStateManager(this, token) as StateHandler<S>
    }

    const actualPublisher = this.parentRegistry.getState(token) as StateWriter<any, any>
    const overlayPublisher = new OverlayPublisher(this.parentRegistry, actualPublisher)
    overlayPublisher.init()

    return overlayPublisher as StateHandler<S>
  }

  unsubscribeFromExternalState() {
    this.registry.forEach(publisher => {
      if (publisher instanceof OverlayPublisher) {
        publisher.detach()
      }
    })
    this.registry.clear()
  }

  updateItemData(data: any) {
    this.itemPublisher.publish(data)
  }

  updateIndex(index: number) {
    this.indexPublisher?.publish(index)
  }
}


export class ListEffect implements StateEffect {
  readonly type = StateListenerType.SystemEffect
  private usesIndex: boolean
  private parentNode!: Node
  private first: VirtualItem | undefined
  private itemCache: Map<any, VirtualItem> = new Map()
  private firstUpdate: VirtualItem | undefined
  private lastUpdate: VirtualItem | undefined
  // private stateMap: Map<Token, StatePublisherCollection>

  constructor(
    private registry: TokenRegistry,
    private domTemplate: DOMTemplate,
    private query: (get: GetState) => Array<any>,
    private templateContext: ListItemTemplateContext<any>,
    private listStart: Node,
    private listEnd: Node,
  ) {
    this.usesIndex = this.templateContext.usesIndex
    // this.stateMap = this.templateContext.getStateMap()
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
    current.unsubscribeFromExternalState()
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
