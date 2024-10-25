import { container, Container, GetState, ReactiveEffect, write } from "../../../store"
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "../fragmentHelpers"
import { IdSequence } from "../idSequence"
import { ArgsController, DOMTemplate, GetDOMTemplate, spheresTemplateData, Zone } from "../render"
import { VirtualNodeKey, StatefulListNode, NodeType } from "../virtualNode"
import { TemplateEffect } from "./templateEffect"

interface VirtualListItem {
  key: any
  actualIndex?: number
  indexState?: Container<number>
  node: Node | undefined
  firstNode?: Node
  lastNode?: Node
}

export class ListEffect extends TemplateEffect implements ReactiveEffect {
  private vnodes: Array<VirtualListItem> = []
  private domTemplate: DOMTemplate
  private usesIndex: boolean
  private templateNodeType: NodeType

  constructor(
    zone: Zone,
    private listVnode: StatefulListNode,
    private argsController: ArgsController | undefined,
    private args: any,
    private listStart: Node,
    private listEnd: Node,
    getDomTemplate: GetDOMTemplate,
  ) {
    super(zone)

    this.usesIndex = this.listVnode.template.usesIndex
    this.templateNodeType = this.listVnode.template.virtualNode.type
    this.domTemplate = getDomTemplate(this.zone, new IdSequence(this.listVnode.id), this.listVnode.template)
  }

  init(get: GetState) {
    this.argsController?.setArgs(this.args)
    const data = this.listVnode.query(get)

    if (this.listStart.nextSibling !== this.listEnd) {
      // Note that this assumes the data is the same on the client
      // as was on the server ...
      this.activateExistingItems(data)
    } else {
      const updatedList = data.map(buildListItem)
      this.patchList(updatedList)
      this.vnodes = updatedList
    }
  }

  private activateExistingItems(data: Array<any>) {
    let dataStart = 0
    let existingNode = this.listStart.nextSibling!
    while (existingNode !== this.listEnd) {
      const virtualItem = buildListItem(data[dataStart], dataStart)
      this.vnodes.push(virtualItem)

      const argsController = this.argsController ?? this.listVnode.template

      let args
      if (this.usesIndex) {
        virtualItem.indexState = container({ initialValue: virtualItem.actualIndex! })
        args = { item: virtualItem.key, index: virtualItem.indexState }
      } else {
        args = virtualItem.key
      }

      for (const effect of this.domTemplate.effects) {
        effect.attach(this.zone, existingNode, argsController, args)
      }

      switch (this.templateNodeType) {
        case NodeType.STATEFUL_LIST: {
          virtualItem.firstNode = existingNode
          virtualItem.lastNode = findListEndNode(existingNode, getListElementId(existingNode))
          existingNode = virtualItem.lastNode!.nextSibling!
          break
        }
        case NodeType.STATEFUL_SWITCH: {
          virtualItem.firstNode = existingNode
          virtualItem.lastNode = findSwitchEndNode(existingNode, getSwitchElementId(existingNode))
          existingNode = virtualItem.lastNode!.nextSibling!
          break
        }
        default: {
          virtualItem.node = existingNode
          // @ts-ignore
          existingNode[spheresTemplateData] = () => argsController.setArgs(args)
          existingNode = existingNode.nextSibling!
        }
      }

      dataStart = dataStart + 1
    }
  }

  run(get: GetState) {
    if (!this.listStart.isConnected) {
      return
    }

    this.argsController?.setArgs(this.args)
    const updatedList = this.listVnode.query(get).map(buildListItem)
    this.patchList(updatedList)
    this.vnodes = updatedList
  }

  createNode(vnode: VirtualListItem): Node {
    let args: any
    if (this.usesIndex) {
      vnode.indexState = container({ initialValue: vnode.actualIndex! })
      args = { item: vnode.key, index: vnode.indexState }
    } else {
      args = vnode.key
    }

    const node = this.renderTemplateInstance(this.domTemplate, this.argsController ?? this.listVnode.template, args)

    if (this.domTemplate.isFragment) {
      vnode.firstNode = node.firstChild!
      vnode.lastNode = node.lastChild!
    } else {
      vnode.node = node
    }

    return node
  }

  patchList(newVKids: Array<VirtualListItem>) {
    let parent = this.listStart.parentNode!

    let oldVKids = this.vnodes

    let oldHead = 0
    let newHead = 0
    let oldTail = oldVKids.length - 1
    let newTail = newVKids.length - 1

    // go through from head to tail and if the keys are the
    // same then I guess position is the same so just patch the node
    // until old or new runs out
    while (newHead <= newTail && oldHead <= oldTail) {
      if (getKey(oldVKids[oldHead]) !== getKey(newVKids[newHead])) {
        break
      }

      this.patch(oldVKids[oldHead++], newVKids[newHead++])
    }

    // now check from the end
    while (newHead <= newTail && oldHead <= oldTail) {
      if (getKey(oldVKids[oldTail]) !== getKey(newVKids[newTail])) {
        break
      }

      this.patch(oldVKids[oldTail--], newVKids[newTail--])
    }

    if (oldHead > oldTail) {
      // then we got through everything old and we are adding new children to the beginning
      const firstNode = oldVKids[oldHead]?.node ?? this.listEnd
      while (newHead <= newTail) {
        const newVKid = newVKids[newHead]
        parent.insertBefore(this.createNode(newVKid), firstNode)
        newHead++
      }

      return
    }

    if (newHead > newTail) {
      // then there are more old kids than new ones and we got through
      // everything so remove from the end of the list
      const range = new Range()
      if (this.domTemplate.isFragment) {
        range.setStartBefore(oldVKids[oldHead].firstNode!)
        range.setEndAfter(oldVKids[oldTail].lastNode!)
      } else {
        range.setStartBefore(oldVKids[oldHead].node!)
        range.setEndAfter(oldVKids[oldTail].node!)
      }
      range.deleteContents()
      return
    }

    const keyed = new Map<VirtualNodeKey, VirtualListItem>()
    const newKeyed = new Set<VirtualNodeKey>()

    // store the old nodes by key
    for (let i = oldHead; i <= oldTail; i++) {
      keyed.set(getKey(oldVKids[i]), oldVKids[i])
    }

    // go through remaining new children and check keys
    while (newHead <= newTail) {
      const oldVKid = oldVKids[oldHead]
      const oldKey = getKey(oldVKid)
      const newKey = getKey(newVKids[newHead])

      // This kind of seems just like an optimization for list reordering
      // Check if we need to skip or remove the old node
      if (
        newKeyed.has(oldKey!) ||
        (newKey === getKey(oldVKids[oldHead + 1]))
      ) {
        oldHead++
        continue
      }

      const newVKid = newVKids[newHead]
      if (oldKey === newKey) {
        // then these are in the correct position so just patch
        // Note that patching sets the node on the newVKid
        this.patch(oldVKid, newVKid)
        newKeyed.add(newKey)
        oldHead++
      } else {
        const tmpVKid = keyed.get(newKey)
        if (tmpVKid !== undefined) {
          // we're reordering keyed elements
          if (this.domTemplate.isFragment) {
            let firstSib = tmpVKid.firstNode!.nextSibling!
            let nodeToMove = firstSib!
            while (nodeToMove !== tmpVKid.lastNode) {
              parent.insertBefore(nodeToMove, (oldVKid && oldVKid.firstNode) ?? this.listEnd)
              nodeToMove = tmpVKid.firstNode!.nextSibling!
            }
            parent.insertBefore(tmpVKid.lastNode!, (oldVKid && oldVKid.firstNode) ?? this.listEnd)
            parent.insertBefore(tmpVKid.firstNode!, firstSib)
          } else {
            parent.insertBefore(tmpVKid.node!, (oldVKid && oldVKid.node) ?? this.listEnd)
          }

          // then patch it -- Note that patching sets the node on the newVKid
          this.patch(tmpVKid, newVKid)
          newKeyed.add(newKey)
        } else {
          // we're adding a new keyed element
          parent.insertBefore(this.createNode(newVKid), (oldVKid && oldVKid.node) ?? this.listEnd)
        }
      }
      newHead++
    }

    // this is removing extra nodes
    // if there was a keyed child in the old node
    // and we never encountered it in the new node
    for (const i of keyed.keys()) {
      if (!newKeyed.has(i)) {
        removeNode(parent, keyed.get(i)!)
      }
    }
  }

  patch(oldVNode: VirtualListItem, newVNode: VirtualListItem): VirtualListItem {
    newVNode.node = oldVNode.node
    newVNode.firstNode = oldVNode.firstNode
    newVNode.lastNode = oldVNode.lastNode
    newVNode.indexState = oldVNode.indexState

    if (this.usesIndex && oldVNode.actualIndex !== newVNode.actualIndex) {
      this.zone.store.dispatch(write(oldVNode.indexState!, newVNode.actualIndex!))
    }

    return newVNode
  }

}

function getKey(vnode: VirtualListItem | undefined): any {
  return vnode?.key
}

function removeNode(parent: Node, vnode: VirtualListItem) {
  if (vnode.firstNode !== undefined) {
    const range = new Range()
    range.setStartBefore(vnode.firstNode!)
    range.setEndAfter(vnode.lastNode!)
    range.deleteContents()
  } else {
    parent.removeChild(vnode.node!)
  }
}

function buildListItem(item: any, index: number): VirtualListItem {
  return {
    key: item,
    actualIndex: index,
    node: undefined
  }
}
