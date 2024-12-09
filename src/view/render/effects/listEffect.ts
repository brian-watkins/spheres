import { container, Container, GetState, write } from "../../../store/index.js"
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "../fragmentHelpers.js"
import { IdSequence } from "../idSequence.js"
import { ArgsController, DOMTemplate, GetDOMTemplate, Zone } from "../index.js"
import { StatefulListNode, NodeType } from "../virtualNode.js"
import { activateTemplateInstance, renderTemplateInstance } from "../renderTemplate.js"
import { EffectWithArgs } from "./effectWithArgs.js"

export interface VirtualItem {
  key: any
  index: number
  isDetached: boolean
  next: VirtualItem | undefined
  indexState?: Container<number>
  node: Node
  firstNode?: Node
  lastNode?: Node
}

export class ListEffect extends EffectWithArgs {
  private domTemplate: DOMTemplate
  private usesIndex: boolean
  private parent!: Node
  private first: VirtualItem | undefined
  private nextArgsController: ArgsController
  private itemCache: Map<any, VirtualItem> = new Map()

  constructor(
    private zone: Zone,
    private listVnode: StatefulListNode,
    argsController: ArgsController | undefined,
    args: any,
    private listStart: Node,
    private listEnd: Node,
    getDomTemplate: GetDOMTemplate
  ) {
    super(argsController, args)
    this.usesIndex = this.listVnode.template.usesIndex
    this.domTemplate = getDomTemplate(
      this.zone,
      new IdSequence(this.listVnode.id),
      this.listVnode.template
    )
    this.nextArgsController = this.getNextArgsController()
  }

  init(get: GetState) {
    this.setArgs()
    const data = this.listVnode.query(get)

    if (this.listStart.nextSibling !== this.listEnd) {
      // Note that this assumes the data is the same on the client
      // as was on the server ...
      this.activate(data)
    } else {
      this.patch(data)
    }
  }

  run(get: GetState) {
    if (!this.listStart.isConnected) {
      return
    }

    this.setArgs()
    const updatedData = this.listVnode.query(get)

    this.patch(updatedData)
  }

  activate(data: Array<any>) {
    let index = 0
    let existingNode: Node = this.listStart.nextSibling!
    let lastItem: VirtualItem | undefined
    while (existingNode !== this.listEnd) {
      const [item, nextNode] = this.activateItem(index, existingNode, data[index])
      if (index === 0) {
        this.first = item
      } else {
        lastItem!.next = item
      }
      lastItem = item
      index++
      existingNode = nextNode
    }
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

    this.parent = this.listStart.parentNode!

    this.first = this.updateFirst(data)

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

  private updateFirst(data: Array<any>): VirtualItem {
    const firstData = data[0]

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
      if (this.usesIndex && this.first !== undefined) {
        this.updateIndex(0, this.first)
      }
      return this.first!
    }

    const updated = this.createItem(0, firstData)
    this.replaceNode(this.first, updated)
    updated.next = this.first.next
    this.first.isDetached = true
    if (this.usesIndex && updated.index !== 0) {
      this.updateIndex(0, updated)
    }
    return updated
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
      return next
    }

    if (data === current.key) {
      return current
    }

    if (data === current.next?.key) {
      this.remove(current)
      last.next = current.next
      current.isDetached = true
      return current.next!
    }

    const next = this.createItem(index, data)
    if (next.isDetached) {
      this.insertAfter(last, next)
    } else {
      this.replaceNode(current, next)
    }
    last.next = next
    next.next = current.next
    current.isDetached = true
    return next
  }

  private append(item: VirtualItem): void {
    this.parent.insertBefore(item.node, this.listEnd)
  }

  private insertAfter(last: VirtualItem, next: VirtualItem): void {
    // NOTE: This only happens for elements at the moment
    this.parent.insertBefore(next.node, last.node.nextSibling)
  }

  private replaceNode(current: VirtualItem, next: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      const range = new Range()
      range.setStartBefore(current.firstNode!)
      range.setEndAfter(current.lastNode!)
      range.deleteContents()
      // Note: This assumes we are dealing with a brand new fragment
      // where the node is the document fragment with all the elements
      this.parent.insertBefore(next.node, current.next?.firstNode ?? this.listEnd)
    } else {
      this.parent.replaceChild(next.node, current.node)
    }
  }

  remove(item: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      const range = new Range()
      range.setStartBefore(item.firstNode!)
      range.setEndAfter(item.lastNode!)
      range.deleteContents()
    } else {
      this.parent.removeChild(item.node)
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

  updateIndex(index: number, item: VirtualItem): void {
    item.index = index
    this.zone.store.dispatch(write(item.indexState!, index))
  }

  activateItem(index: number, node: Node, data: any): [VirtualItem, Node] {
    let virtualItem: any = {
      key: data,
      next: undefined
    }

    let args
    if (this.usesIndex) {
      virtualItem.indexState = container({ initialValue: index })
      args = { item: data, index: virtualItem.indexState }
    } else {
      args = data
    }

    activateTemplateInstance(this.zone, this.domTemplate, node, this.nextArgsController, args)

    switch (this.listVnode.template.virtualNode.type) {
      case NodeType.STATEFUL_LIST: {
        virtualItem.firstNode = node
        virtualItem.lastNode = findListEndNode(node, getListElementId(node))
        return [virtualItem, virtualItem.lastNode!.nextSibling!]
      }
      case NodeType.STATEFUL_SELECTOR: {
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

  createItem(index: number, data: any): VirtualItem {
    const cached = this.itemCache.get(data)
    if (cached !== undefined) {
      return { ...cached, next: undefined }
    }

    let args: any

    let indexState: Container<number> | undefined
    if (this.usesIndex) {
      indexState = container({ initialValue: index })
      args = { item: data, index: indexState }
    } else {
      args = data
    }

    const node = renderTemplateInstance(
      this.zone,
      this.domTemplate,
      this.nextArgsController,
      args
    )

    const item: VirtualItem = {
      key: data,
      index,
      isDetached: false,
      indexState,
      next: undefined,
      node
    }

    if (this.domTemplate.isFragment) {
      item.firstNode = node.firstChild!
      item.lastNode = node.lastChild!
    }

    return item
  }

  getNextArgsController(): ArgsController {
    const currentArgsController = this.argsController
    const currentArgs = this.args
    const template = this.listVnode.template
    return {
      setArgs(nextArgs) {
        currentArgsController?.setArgs(currentArgs)
        template.setArgs(nextArgs)
      }
    }
  }
}