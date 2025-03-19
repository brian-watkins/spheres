import { GetState, write } from "../../../store/index.js"
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "../fragmentHelpers.js"
import { activate, DOMTemplate, render, TemplateType } from "../domTemplate.js"
import { StateListener, StateListenerVersion, TokenRegistry } from "../../../store/tokenRegistry.js"
import { dispatchMessage } from "../../../store/message.js"
import { ListItemOverlayTokenRegistry, ListItemTemplateContext } from "../templateContext.js"

export interface VirtualItem {
  key: any
  index: number
  isDetached: boolean
  prev: VirtualItem | undefined
  next: VirtualItem | undefined
  node: Node
  firstNode?: Node
  lastNode?: Node
  registry: ListItemOverlayTokenRegistry
}


export class ListEffect implements StateListener {
  private usesIndex: boolean
  private parentNode!: Node
  private first: VirtualItem | undefined
  private itemCache: Map<any, VirtualItem> = new Map()
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

  patch(data: Array<any>) {
    if (data.length === 0) {
      if (this.first !== undefined) {
        this.removeAllAfter(this.first)
        this.first = undefined
      }
      return
    }

    if (!this.domTemplate.isFragment && this.first !== undefined) {
      this.cacheOutOfPlaceItems(data)
    }

    this.parentNode = this.listStart.parentNode!

    this.first = this.updateFirst(data[0])

    this.updateRest(this.first, data)

    this.itemCache.clear()
  }

  private cacheOutOfPlaceItems(data: Array<any>) {
    let item = this.first
    for (let i = 0; i < data.length; i++) {
      if (item === undefined) {
        break
      }
      if (item.key !== data[i]) {
        this.itemCache.set(item.key, item)
      }
      if (item.next !== undefined && item.next.key === data[i]) {
        item = item.next.next
      } else {
        item = item.next
      }
    }
  }

  private updateFirst(firstData: any): VirtualItem {
    if (this.first === undefined) {
      const item = this.createItem(0, firstData)
      this.append(item)
      return item
    }

    if (this.first.key === firstData) {
      return this.first
    }

    if (this.first.next?.key === firstData) {
      this.remove(this.first)
      this.first = this.first.next
      this.first!.prev = undefined
      if (this.usesIndex && this.first !== undefined) {
        this.updateIndex(0, this.first)
      }
      return this.first!
    }

    const cached = this.itemCache.get(firstData)
    if (cached !== undefined) {
      const updated = { ...cached }
      this.replaceNode(this.first, updated)
      updated.prev!.next = updated.next
      if (updated.next) {
        updated.next.prev = updated.prev
      }
      updated.next = this.first.next
      updated.prev = undefined
      this.first.isDetached = true
      if (this.usesIndex && updated.index !== 0) {
        this.updateIndex(0, updated)
      }
      return updated
    }

    if (this.itemCache.has(this.first.key)) {
      const created = this.createItem(0, firstData)
      this.insertBefore(this.first, created)
      created.next = this.first
      this.first.prev = created
      return created
    }

    this.updateItemData(this.first, firstData)
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
  }

  private updateItem(index: number, last: VirtualItem, data: any): VirtualItem {
    const current = last.next

    if (current === undefined) {
      const next = this.createItem(index, data)
      this.append(next)
      last.next = next
      next.prev = last
      return next
    }

    if (data === current.key) {
      return current
    }

    if (data === current.next?.key) {
      this.remove(current)
      last.next = current.next
      current.next!.prev = last
      current.isDetached = true
      return current.next!
    }

    const cached = this.itemCache.get(data)
    if (cached !== undefined) {
      const next: VirtualItem = { ...cached }
      if (next.isDetached) {
        this.insertAfter(last, next)
        last.next = next
        next.next = current
        current.prev = next
        next.prev = last
        next.isDetached = false
      } else {
        if (next.prev) {
          next.prev.next = next.next
        }
        this.replaceNode(current, next)
        last.next = next
        next.prev = last
        next.next = current.next
        if (current.next) {
          current.next.prev = next
        }
        current.isDetached = true
      }
      return next
    }

    if (this.itemCache.has(current.key)) {
      const created = this.createItem(index, data)
      this.insertAfter(last, created)
      last.next = created
      created.prev = last
      created.next = current
      current.prev = created
      return created
    }

    this.updateItemData(current, data)
    return current
  }

  private append(item: VirtualItem): void {
    this.parentNode.insertBefore(item.node, this.listEnd)
  }

  private insertBefore(reference: VirtualItem, first: VirtualItem): void {
    this.parentNode.insertBefore(first.node, reference.node)
  }

  private insertAfter(last: VirtualItem, next: VirtualItem): void {
    // NOTE: This only happens for elements at the moment
    this.parentNode.insertBefore(next.node, last.node.nextSibling)
  }

  private replaceNode(current: VirtualItem, next: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      const range = new Range()
      range.setStartBefore(current.firstNode!)
      range.setEndAfter(current.lastNode!)
      range.deleteContents()
      // Note: This assumes we are dealing with a brand new fragment
      // where the node is the document fragment with all the elements
      this.parentNode.insertBefore(next.node, current.next?.firstNode ?? this.listEnd)
    } else {
      this.parentNode.replaceChild(next.node, current.node)
    }
  }

  remove(item: VirtualItem): void {
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

  updateItemData(item: VirtualItem, itemData: any): void {
    item.registry.updateItemData(itemData)
    item.key = itemData
  }

  updateIndex(index: number, item: VirtualItem): void {
    item.index = index
    dispatchMessage(item.registry, write(this.templateContext.indexToken, index))
  }

  createItem(index: number, data: any): VirtualItem {
    const overlayRegistry = this.templateContext.createOverlayRegistry(this.registry, data, index)
    const node = render(this.domTemplate, overlayRegistry)

    const item: VirtualItem = {
      key: data,
      index,
      isDetached: false,
      prev: undefined,
      next: undefined,
      registry: overlayRegistry,
      node
    }

    if (this.domTemplate.isFragment) {
      item.firstNode = node.firstChild!
      item.lastNode = node.lastChild!
    }

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
  let virtualItem: any = {
    key: data,
    next: undefined,
    prev: undefined
  }

  const overlayRegistry = context.createOverlayRegistry(registry, data, index)
  activate(template, overlayRegistry, node)
  virtualItem.registry = overlayRegistry

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
