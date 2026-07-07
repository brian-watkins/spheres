import { GetState } from "../../../store/index.js"
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "../fragmentHelpers.js"
import { activate, DOMTemplate, render, TemplateType } from "../domTemplate.js"
import { StateEffect, StateListenerType, TokenRegistry } from "../../../store/tokenRegistry.js"
import { ListItemTemplateContext } from "../templateContext.js"
import { ItemState } from "./list/itemState.js"
import { VirtualItem } from "./list/virtualItem.js"
import { ListPatch, ListUpdateType, PatchResult } from "./list/patch.js"

export class ListEffect implements StateEffect {
  readonly type = StateListenerType.ViewEffect
  private parentNode!: Element
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
    this.parentNode = this.listStart.parentNode! as Element

    if (data.length === 0) {
      if (this.first !== undefined) {
        this.removeAllAfter(this.first)
        this.first = undefined
        this.last = undefined
      }
      return
    }

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
      this.removeAllAfter(this.first)
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
    if (start.prev === undefined && this.listStart.previousSibling === null && this.listEnd.nextSibling === null) {
      // just replace everything if the list itself has no siblings under this parent
      this.parentNode.replaceChildren(this.listStart, this.listEnd)
    } else {
      const range = new Range()
      range.setEndBefore(this.listEnd)

      if (this.domTemplate.isFragment) {
        range.setStartBefore(start.firstNode!)
      } else {
        range.setStartBefore(start.node)
      }

      range.deleteContents()
    }

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
