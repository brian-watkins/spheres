import { container, Container, GetState, ReactiveEffect, write } from "../../../store/index.js"
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "../fragmentHelpers.js"
import { IdSequence } from "../idSequence.js"
import { ArgsController, DOMTemplate, GetDOMTemplate, spheresTemplateData, Zone } from "../index.js"
import { StatefulListNode, NodeType } from "../virtualNode.js"
import { renderTemplateInstance } from "../renderTemplate.js"

export interface VirtualElement {
  type: "element"
  key: any
  index: number
  next: VirtualItem | undefined
  indexState?: Container<number>
  node: Node
}

export interface VirtualFragment {
  type: "fragment"
  key: any
  index: number
  next: VirtualItem | undefined
  indexState?: Container<number>
  node: Node
  firstNode: Node
  lastNode: Node
}

export type VirtualItem = VirtualElement | VirtualFragment

export class ListEffect implements ReactiveEffect {
  private domTemplate: DOMTemplate
  private usesIndex: boolean
  private templateNodeType: NodeType
  private parent!: Node
  private first: VirtualItem | undefined

  constructor(
    private zone: Zone,
    private listVnode: StatefulListNode,
    private argsController: ArgsController | undefined,
    private args: any,
    private listStart: Node,
    private listEnd: Node,
    getDomTemplate: GetDOMTemplate
  ) {
    this.usesIndex = this.listVnode.template.usesIndex
    this.templateNodeType = this.listVnode.template.virtualNode.type
    this.domTemplate = getDomTemplate(
      this.zone,
      new IdSequence(this.listVnode.id),
      this.listVnode.template
    )
  }

  init(get: GetState) {
    this.argsController?.setArgs(this.args)
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

    this.argsController?.setArgs(this.args)
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
    this.parent = this.listStart.parentNode!

    if (data.length === 0) {
      if (this.first !== undefined) {
        this.removeAllAfter(this.first)
        this.first = undefined
      }
      return
    }

    this.first = this.updateFirst(data)

    let last = this.first
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
    return updated
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
      return current.next!
    }

    const next = this.createItem(index, data)
    this.replaceNode(current, next)
    last.next = next
    next.next = current.next
    return next
  }

  private append(item: VirtualItem): void {
    this.parent.insertBefore(item.node, this.listEnd)
  }

  private replaceNode(current: VirtualItem, next: VirtualItem): void {
    switch (current.type) {
      case "element":
        this.parent.replaceChild(next.node, current.node)
        break
      case "fragment":
        const range = new Range()
        range.setStartBefore(current.firstNode)
        range.setEndAfter(current.lastNode)
        range.deleteContents()
        //@ts-ignore
        this.parent.insertBefore(next.node, current.next?.firstNode ?? this.endNode)
        break
    }
  }

  remove(item: VirtualItem): void {
    switch (item.type) {
      case "element":
        this.parent.removeChild(item.node)
        break
      case "fragment":
        const range = new Range()
        range.setStartBefore(item.firstNode)
        range.setEndAfter(item.lastNode)
        range.deleteContents()
        break
    }
  }

  private removeAllAfter(start: VirtualItem) {
    if (start === undefined) return

    const range = new Range()
    range.setEndBefore(this.listEnd)

    switch (start.type) {
      case "element":
        range.setStartBefore(start.node)
        break
      case "fragment":
        range.setStartBefore(start.firstNode)
        break
    }

    range.deleteContents()
  }

  updateIndex(index: number, item: VirtualItem): void {
    // console.log("Updating index to", item.indexState, index)
    item.index = index
    this.zone.store.dispatch(write(item.indexState!, index))
  }

  activateItem(index: number, node: Node, data: any): [VirtualItem, Node] {
    let virtualItem: any
    if (this.domTemplate.isFragment) {
      virtualItem = {
        type: "fragment",
        key: data,
        next: undefined
      }
    } else {
      virtualItem = {
        type: "element",
        key: data,
        next: undefined
      }
    }

    const argsController = this.argsController ?? this.listVnode.template

    let args
    if (this.usesIndex) {
      virtualItem.indexState = container({ initialValue: index })
      args = { item: data, index: virtualItem.indexState }
    } else {
      args = data
    }

    for (const effect of this.domTemplate.effects) {
      effect.attach(this.zone, node, argsController, args)
    }

    switch (this.templateNodeType) {
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
        // @ts-ignore
        node[spheresTemplateData] = () => argsController.setArgs(args)
        return [virtualItem, node.nextSibling!]
      }
    }
  }

  createItem(index: number, data: any): VirtualItem {
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
      this.argsController ?? this.listVnode.template,
      args
    )

    if (this.domTemplate.isFragment) {
      return {
        type: "fragment",
        key: data,
        index,
        node: node,
        indexState,
        firstNode: node.firstChild!,
        lastNode: node.lastChild!,
        next: undefined,
      }
    } else {
      return {
        type: "element",
        key: data,
        index,
        indexState,
        next: undefined,
        node,
      }
    }
  }
}