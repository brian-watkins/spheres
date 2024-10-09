import { container, Container, GetState, ReactiveEffect, write } from "../../../store"
import { IdentifierGenerator } from "../idGenerator"
import { spheresTemplateData, TemplateData, TemplateNodeRenderer, Zone } from "../render"
import { VirtualNodeKey, StatefulListNode } from "../virtualNode"

interface VirtualListItem {
  key: any
  actualIndex?: number
  indexState?: Container<number>
  node: Node | undefined
}

export class ListEffect implements ReactiveEffect {
  private templateData: TemplateData
  private vnodes: Array<VirtualListItem> = []
  private idGenerator: IdentifierGenerator

  constructor(
    protected zone: Zone,
    protected listVnode: StatefulListNode,
    protected listStart: Node,
    protected listEnd: Node,
    private templateNodeGenerator: TemplateNodeRenderer,
    private templateNodeActivator?: (node: Node, templateData: TemplateData) => void
  ) {
    this.idGenerator = new IdentifierGenerator(this.listVnode.id)
    this.templateData = { template: this.listVnode.template, args: { item: undefined } }
  }

  init(get: GetState) {
    const data = this.listVnode.query(get)
    const parent = this.listStart.parentNode!
    const builder = this.listVnode.template.usesIndex ? buildListItemWithIndexState : buildListItem

    let dataStart = 0
    let existingNode = this.listStart.nextSibling!
    while (existingNode !== this.listEnd) {
      const virtualItem = builder(data[dataStart], dataStart)
      virtualItem.node = existingNode
      this.vnodes.push(virtualItem)
      this.templateData.args = { item: virtualItem.key, index: virtualItem.indexState }
      // @ts-ignore
      existingNode[spheresTemplateData] = { ...this.templateData };
      // this is bad should refactor somehow
      this.templateNodeActivator!(existingNode, this.templateData)
      existingNode = existingNode.nextSibling!
      dataStart = dataStart + 1
    }

    for (let i = dataStart; i < data.length; i++) {
      const virtualItem = builder(data[i], i)
      const templateNode = this.createNode(virtualItem)
      parent.insertBefore(templateNode, this.listEnd)
      virtualItem.node = templateNode
      this.vnodes.push(virtualItem)
    }
  }

  run(get: GetState) {
    const builder = this.listVnode.template.usesIndex ? buildListItemWithIndex : buildListItem
    const updatedList = this.listVnode.query(get).map(builder)
    this.patchList(updatedList)
    this.vnodes = updatedList
  }

  createNode(vnode: VirtualListItem): Node {
    this.idGenerator.reset()
    this.templateData.args = { item: vnode.key, index: vnode.indexState }
    return this.templateNodeGenerator(this.zone, this.idGenerator, this.templateData)
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
        newVKid.node = parent.insertBefore(this.createNode(newVKid), firstNode)
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
        this.patch(oldVKid, newVKid)
        newKeyed.add(newKey)
        oldHead++
      } else {
        const tmpVKid = keyed.get(newKey)
        if (tmpVKid !== undefined) {
          // we're reordering keyed elements -- first move the element to the right place
          tmpVKid.node = parent.insertBefore(tmpVKid.node!, (oldVKid && oldVKid.node) ?? this.listEnd)
          // then patch it -- Note that patching sets the node on the newVKid
          this.patch(tmpVKid, newVKid)
          newKeyed.add(newKey)
        } else {
          // we're adding a new keyed element
          newVKid.node = parent.insertBefore(this.createNode(newVKid), (oldVKid && oldVKid.node) ?? this.listEnd)
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
    newVNode.indexState = oldVNode.indexState

    if (oldVNode.actualIndex !== newVNode.actualIndex) {
      this.zone.store.dispatch(write(oldVNode.indexState!, newVNode.actualIndex!))
    }

    return newVNode
  }

}

function getKey(vnode: VirtualListItem | undefined): any {
  // @ts-ignore
  return vnode?.key
}

function removeNode(parent: Node, vnode: VirtualListItem) {
  parent.removeChild(vnode.node!)
}

function buildListItemWithIndexState(item: any, index: number): VirtualListItem {
  return {
    key: item,
    actualIndex: index,
    indexState: container({ initialValue: index }),
    node: undefined
  }
}

function buildListItemWithIndex(item: any, index: number): VirtualListItem {
  return {
    key: item,
    actualIndex: index,
    node: undefined
  }
}

function buildListItem(item: any, _: number): VirtualListItem {
  return {
    key: item,
    node: undefined
  }
}