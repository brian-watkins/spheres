import { GetState, ReactiveEffect, Store } from "../../../store"
import { TemplateListNode, TemplateNode, VirtualNodeKey } from "../virtualNode"

export type TemplateNodeGenerator = (store: Store, virtualNode: TemplateNode) => Node

interface VirtualListItem {
  key: VirtualNodeKey
  node: Node | undefined
}

export class ListEffect implements ReactiveEffect {
  private templateVNode: TemplateNode | undefined
  private vnodes: Array<VirtualListItem> = []

  constructor(private store: Store, private vnode: TemplateListNode, private listStartNode: Node, private templateNodeGenerator: TemplateNodeGenerator) { }

  init(get: GetState) {
    const data = this.vnode.argList(get)

    const parent = this.listStartNode.parentNode!
    for (let i = 0; i < data.length; i++) {
      const virtualItem: VirtualListItem = { key: data[i], node: undefined }
      const templateNode = this.createNode(this.store, virtualItem)
      parent.insertBefore(templateNode, this.listStartNode)
      virtualItem.node = templateNode
      this.vnodes.push(virtualItem)
    }
  }

  run(get: GetState) {
    const data = this.vnode.argList(get)

    const updatedList: Array<VirtualListItem> = data.map(item => ({
      key: item,
      node: undefined
    }))

    this.patchList(updatedList)

    this.vnodes = updatedList
  }

  createNode(store: Store, vnode: VirtualListItem): Node {
    if (this.templateVNode === undefined) {
      this.templateVNode = this.vnode.templateGenerator(vnode.key)
    } else {
      this.templateVNode.args = vnode.key
    }

    return this.templateNodeGenerator(store, this.templateVNode)
  }

  patchList(newVKids: Array<VirtualListItem>) {
    let parent = this.listStartNode.parentNode!

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

      patch(oldVKids[oldHead++], newVKids[newHead++])
    }

    // now check from the end
    while (newHead <= newTail && oldHead <= oldTail) {
      if (getKey(oldVKids[oldTail]) !== getKey(newVKids[newTail])) {
        break
      }

      patch(oldVKids[oldTail--], newVKids[newTail--])
    }

    if (oldHead > oldTail) {
      // then we got through everything old and we are adding new children to the beginning
      const firstNode = oldVKids[oldHead]?.node ?? this.listStartNode
      while (newHead <= newTail) {
        const newVKid = newVKids[newHead]
        newVKid.node = parent.insertBefore(this.createNode(this.store, newVKid), firstNode)
        newHead++
      }

      return
    }

    if (newHead > newTail) {
      // then there are more old kids than new ones and we got through
      // everything so remove from the end of the list
      const range = new Range()
      range.setStartBefore(oldVKids[oldHead].node!)
      range.setEndAfter(oldVKids[oldTail].node!)
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
        patch(oldVKid, newVKid)
        newKeyed.add(newKey)
        oldHead++
      } else {
        const tmpVKid = keyed.get(newKey)
        if (tmpVKid !== undefined) {
          // we're reordering keyed elements -- first move the element to the right place
          tmpVKid.node = parent.insertBefore(tmpVKid.node!, (oldVKid && oldVKid.node) ?? this.listStartNode)
          // then patch it -- Note that patching sets the node on the newVKid
          patch(tmpVKid, newVKid)
          newKeyed.add(newKey)
        } else {
          // we're adding a new keyed element
          // console.log("inserting new b")
          newVKid.node = parent.insertBefore(this.createNode(this.store, newVKid), (oldVKid && oldVKid.node) ?? this.listStartNode)
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

}

function getKey(vnode: VirtualListItem | undefined): any {
  // @ts-ignore
  return vnode?.key
}

function removeNode(parent: Node, vnode: VirtualListItem) {
  parent.removeChild(vnode.node!)
}

export function patch(oldVNode: VirtualListItem, newVNode: VirtualListItem): VirtualListItem {
  newVNode.node = oldVNode.node
  return newVNode
}
