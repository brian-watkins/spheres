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

enum PatchResult {
  Survive, Delete, Replace
}

class VirtualItem {
  prev: VirtualItem | undefined = undefined
  next: VirtualItem | undefined = undefined
  patchResult: PatchResult = PatchResult.Survive

  constructor(public state: ItemState, public key: any, public index: number, public node: Node, public firstNode: Node | undefined, public lastNode: Node | undefined) { }

  updateIndex(index: number) {
    this.index = index
    this.state.updateIndex(index)
  }

  unsubscribeFromExternalState() {
    this.state.unsubscribeFromExternalState()
  }
}

enum ListUpdateType {
  Insert, Delete, Change
}

interface ListInsert {
  type: ListUpdateType.Insert
  data: any
  before: VirtualItem
  index: number
}

interface ListChangeItem {
  type: ListUpdateType.Change
  item: VirtualItem
  data: any
  index: number
}

interface ListDelete {
  type: ListUpdateType.Delete
  item: VirtualItem
}

type ListUpdate = ListInsert | ListDelete | ListChangeItem

class ListPatch {
  readonly updates: Array<ListUpdate> = []
  index: number = 0
  someItemRemainsInPlace: boolean = false
  someItemMoves: boolean = false

  private itemCache: Map<any, VirtualItem> = new Map()

  addUpdate(update: ListUpdate) {
    this.updates.push(update)
  }

  getItem(key: any): VirtualItem | undefined {
    return this.itemCache.get(key)
  }

  setItem(item: VirtualItem) {
    this.itemCache.set(item.key, item)
  }

  get replacingAllItems(): boolean {
    return !this.someItemRemainsInPlace && !this.someItemMoves
  }

  get onlyAppendingItems(): boolean {
    return this.updates.length === 0
  }

  scan(first: VirtualItem | undefined, data: Array<any>) {
    let item: VirtualItem | undefined = first
    let index = 0
    let someItemRemainsInPlace = false
    while (item !== undefined) {
      if (index >= data.length) {
        // ran out of new data so delete; cache because may have moved earlier
        this.setItem(item)
        this.addUpdate({
          type: ListUpdateType.Delete,
          item
        })
        item.patchResult = PatchResult.Delete
        item = item.next
        continue
      }

      if (item.key === data[index]) {
        // there is a match so update index if necessary and go to the next
        someItemRemainsInPlace = true
        if (item.index !== index) {
          item.updateIndex(index)
        }

        item = item.next
        index = index + 1
        continue
      }

      if (item.key === data[index + 1]) {
        // insert an item and then go to next data so we get back on track
        this.addUpdate({
          type: ListUpdateType.Insert,
          data: data[index],
          before: item,
          index
        })

        index = index + 1
        continue
      }

      if (data[index] === item.next?.key) {
        // delete an item so cache and skip to next item
        // but keep data the same so we get back on track
        item.patchResult = PatchResult.Delete
        this.setItem(item)
        this.addUpdate({
          type: ListUpdateType.Delete,
          item
        })

        if (item.next !== undefined) {
          // Cache next in case anything needs to be inserted
          // before this item that is deleted
          this.setItem(item.next)
        }

        item = item.next
        continue
      }

      // by default, change the item in this slot
      // and cache the current in case it is moved
      this.addUpdate({
        type: ListUpdateType.Change,
        item,
        data: data[index],
        index
      })

      this.setItem(item)
      item.patchResult = PatchResult.Replace

      if (item.next !== undefined && item.next.key === data[index + 1]) {
        this.setItem(item.next)
      }

      item = item.next
      index = index + 1
    }

    this.index = index
    this.someItemRemainsInPlace = someItemRemainsInPlace
  }

  scanForItemsToRemove(data: Array<any>): Array<VirtualItem> {
    for (let x = this.index; x < data.length; x++) {
      const item = this.getItem(data[x])
      if (item !== undefined) {
        this.someItemMoves = true
        item.patchResult = PatchResult.Survive
      }
    }

    const itemsToRemove: Array<VirtualItem> = []
    for (const update of this.updates) {
      switch (update.type) {
        case ListUpdateType.Change: {
          const item = this.getItem(update.data)
          if (item !== undefined) {
            this.someItemMoves = true
            item.patchResult = PatchResult.Survive
          }
          break
        }
        case ListUpdateType.Insert: {
          const item = this.getItem(update.data)
          if (item !== undefined) {
            this.someItemMoves = true
            item.patchResult = PatchResult.Survive
          }
          break
        }
        case ListUpdateType.Delete: {
          itemsToRemove.push(update.item)
          break
        }
      }
    }

    return itemsToRemove
  }
}

export class ListEffect implements StateEffect {
  readonly type = StateListenerType.ViewEffect
  private parentNode!: Node
  private first: VirtualItem | undefined
  private last: VirtualItem | undefined

  constructor(
    private registry: TokenRegistry,
    private domTemplate: DOMTemplate,
    private query: (get: GetState) => Array<any>,
    private templateContext: ListItemTemplateContext<any>,
    private listStart: Node,
    private listEnd: Node,
  ) { }

  setVirtualList(first: VirtualItem | undefined, last: VirtualItem | undefined) {
    this.first = first
    this.last = last
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
        this.last = undefined
      }
      return
    }

    this.parentNode = this.listStart.parentNode!

    if (this.first === undefined) {
      this.appendNewItems(data, 0)
      return
    }

    const patch = new ListPatch()
    patch.scan(this.first, data)

    if (patch.onlyAppendingItems) {
      this.appendNewItems(data, patch.index)
      return
    }

    const itemsToRemove = patch.scanForItemsToRemove(data)

    if (patch.replacingAllItems) {
      this.removeAllAfter(this.first!)
      this.first = undefined
      this.last = undefined
      this.appendNewItems(data, 0)
      return
    }

    this.processDeletes(itemsToRemove)

    this.processAppends(data, patch)

    this.processUpdates(data, patch)
  }

  private appendNewItems(data: Array<any>, start: number) {
    for (let x = start; x < data.length; x++) {
      const virtualItem = this.createItem(x, data[x])
      this.appendNode(virtualItem)
      this.appendItem(virtualItem)
    }
  }

  private processDeletes(itemsToRemove: Array<VirtualItem>): void {
    for (const item of itemsToRemove) {
      if (item.patchResult === PatchResult.Delete) {
        this.removeNode(item)
        this.deleteItem(item)
      }
    }
  }

  private processAppends(data: Array<any>, state: ListPatch) {
    for (let x = state.index; x < data.length; x++) {
      this.placeUpdatedItem(state, data[x], x, undefined)
    }
  }

  private processUpdates(data: Array<any>, state: ListPatch) {
    const updates = state.updates
    for (let i = updates.length - 1; i > -1; i--) {
      const update = updates[i]
      switch (update.type) {
        case ListUpdateType.Insert: {
          this.placeUpdatedItem(state, update.data, update.index, update.before)
          break
        }
        case ListUpdateType.Change: {
          const cached = state.getItem(update.data)
          if (cached === undefined && update.item.patchResult === PatchResult.Replace) {
            const virtualItem = this.createItem(update.index, update.data)
            state.setItem(virtualItem)
            this.replaceNode(update.item, virtualItem)
            this.replaceItem(update.item, virtualItem)
          } else {
            this.placeUpdatedItem(state, update.data, update.index, state.getItem(data[update.index + 1]))
            if (update.item.patchResult === PatchResult.Replace) {
              this.removeNode(update.item)
              this.deleteItem(update.item)
            }
          }
          break
        }
      }
    }
  }

  private placeUpdatedItem(state: ListPatch, data: any, index: number, before: VirtualItem | undefined) {
    const cached = state.getItem(data)
    if (cached === undefined) {
      const item = this.createItem(index, data)
      state.setItem(item)
      this.placeNewItem(item, before)
    } else {
      this.moveCachedItem(cached, before)
      cached.updateIndex(index)
    }
  }

  private placeNewItem(item: VirtualItem, before: VirtualItem | undefined) {
    if (before !== undefined) {
      this.insertNodeBefore(before, item)
      this.insertItemBefore(before, item)
    } else {
      this.appendNode(item)
      this.appendItem(item)
    }
  }

  private moveCachedItem(item: VirtualItem, before: VirtualItem | undefined) {
    if (before !== undefined) {
      this.moveNodeBefore(before, item)
      this.deleteItem(item)
      this.insertItemBefore(before, item)
    } else {
      this.moveNodeToEnd(item)
      this.deleteItem(item)
      this.appendItem(item)
    }
  }

  private appendNode(item: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      this.parentNode.insertBefore(this.fragmentFor(item), this.listEnd)
    } else {
      this.parentNode.insertBefore(item.node, this.listEnd)
    }
  }

  private insertNodeBefore(before: VirtualItem, item: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      this.parentNode.insertBefore(this.fragmentFor(item), before.firstNode!)
    } else {
      this.parentNode.insertBefore(item.node, before.node)
    }
  }

  private replaceItem(current: VirtualItem, next: VirtualItem) {
    next.prev = current.prev
    next.next = current.next
    if (current.prev) {
      current.prev.next = next
    } else {
      this.first = next
    }
    if (current.next) {
      current.next.prev = next
    } else {
      this.last = next
    }
  }

  private appendItem(item: VirtualItem) {
    item.next = undefined
    if (this.last === undefined) {
      item.prev = undefined
      this.first = item
      this.last = item
    } else {
      this.last.next = item
      item.prev = this.last
      this.last = item
    }
  }

  private insertItemBefore(before: VirtualItem, item: VirtualItem) {
    if (before.prev) {
      before.prev.next = item
      item.prev = before.prev
    } else {
      this.first = item
      item.prev = undefined
    }
    before.prev = item
    item.next = before
  }

  private moveNodeBefore(before: VirtualItem, item: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      if (item.lastNode!.nextSibling === before.firstNode) {
        return
      }
      this.parentNode.insertBefore(this.fragmentFor(item), before.firstNode!)
    } else {
      if (item.node.nextSibling === before.node) {
        return
      }
      this.moveNode(item.node, before.node)
    }
  }

  private moveNodeToEnd(item: VirtualItem) {
    if (this.domTemplate.isFragment) {
      if (item.lastNode!.nextSibling === this.listEnd) {
        return
      }
      this.appendNode(item)
    } else {
      if (item.node.nextSibling === this.listEnd) {
        return
      }
      this.moveNode(item.node, this.listEnd)
    }
  }

  private moveNode(node: Node, beforeNode: Node): void {
    const parentElement = this.parentNode as Element
    if (parentElement.moveBefore !== undefined) {
      parentElement.moveBefore(node, beforeNode)
    } else {
      this.parentNode.insertBefore(node, beforeNode)
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
    current.unsubscribeFromExternalState()
  }

  private removeNode(item: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      item.node = this.detachFragment(item)
    } else {
      this.parentNode.removeChild(item.node)
    }
    item.unsubscribeFromExternalState()
  }

  private deleteItem(item: VirtualItem): void {
    if (item.next) {
      item.next.prev = item.prev
    } else {
      this.last = item.prev
    }
    if (item.prev) {
      item.prev.next = item.next
    } else {
      this.first = item.next
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

export function activateList(registry: TokenRegistry, context: ListItemTemplateContext<any>, template: DOMTemplate, startNode: Node, endNode: Node, data: Array<any>): [VirtualItem | undefined, VirtualItem | undefined] {
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
  return [firstItem, lastItem]
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
