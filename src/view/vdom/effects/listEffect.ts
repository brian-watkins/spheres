import { container, Container, GetState, ReactiveEffect, Store, write } from "../../../store"
import { makeTemplate, TemplateNode, VirtualNodeKey, ZoneListNode } from "../virtualNode"

export type TemplateNodeGenerator = (store: Store, virtualNode: TemplateNode) => Node

interface VirtualListItem {
  key: any
  actualIndex?: number
  indexState?: Container<number>
  node: Node | undefined
}

export class ListEffect implements ReactiveEffect {
  private templateVNode: TemplateNode | undefined
  private vnodes: Array<VirtualListItem> = []
  // public parent!: Node

  constructor(private store: Store, private vnode: ZoneListNode, private listStartNode: Node, private templateNodeGenerator: TemplateNodeGenerator) { }

  init(get: GetState) {
    const data = this.vnode.argList(get)

    // REVISIT -- maybe there's a nicer way -- here we're trying to support
    // both the straigh-ahead create node flow and the create template flow
    // where the nodes are already mounted on the parent (because they are cloned)
    // if (this.listStartNode.parentNode) {
    //   this.parent = this.listStartNode.parentNode
    // } else {
    //   this.parent = document.createDocumentFragment()
    //   this.parent.appendChild(this.listStartNode)
    // }

    // NOTE: Is there any way to avoid creating a container here?
    // Can we somehow defer container creation until it's actually
    // referenced by some reactive effect?
    // For now I guess it's fine but it may be slow

    const parent = this.listStartNode.parentNode!

    if (this.vnode.template.usesIndex) {
      for (let i = 0; i < data.length; i++) {
        const virtualItem: VirtualListItem = {
          key: data[i],
          actualIndex: i,
          indexState: container({ initialValue: i }),
          node: undefined
        }
        const templateNode = this.createNode(this.store, virtualItem)
        parent.insertBefore(templateNode, this.listStartNode)
        virtualItem.node = templateNode
        this.vnodes.push(virtualItem)
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        const virtualItem: VirtualListItem = {
          key: data[i],
          // actualIndex: undefined,
          // indexState: undefined,
          node: undefined
        }
        const templateNode = this.createNode(this.store, virtualItem)
        parent.insertBefore(templateNode, this.listStartNode)
        virtualItem.node = templateNode
        this.vnodes.push(virtualItem)
      }  
    }

  }

  run(get: GetState) {
    const data = this.vnode.argList(get)

    // We might not need index here ... we would set the index attribute
    // with the container from the existing vnodes list as we patch?
    
    
    const updatedList: Array<VirtualListItem> = this.vnode.template.usesIndex ? data.map((item, index) => ({
      key: item,
      actualIndex: index,
      indexState: this.vnode.template.usesIndex ? container({ initialValue: index }) : undefined, // seems like this is not good, could be slow
      node: undefined
    })) :
    data.map((item) => ({
      key: item,
      // actualIndex: index,
      // indexState: this.vnode.template.usesIndex ? container({ initialValue: index }) : undefined, // seems like this is not good, could be slow
      node: undefined
    }))

    // console.log("Got updated data for zones", updatedList)

    this.patchList(updatedList)

    // the problem here is that we would lose the vnodes here unless they were patched
    // how do we even have the nodes? don't we lose those too?
    this.vnodes = updatedList
  }

  createNode(store: Store, vnode: VirtualListItem): Node {
    if (this.templateVNode === undefined) {
      // this.templateVNode = this.vnode.templateGenerator(vnode.key)
      // I think here instead of index being a number, we need to make it a Container<number>
      this.templateVNode = makeTemplate(this.vnode.template, { item: vnode.key, index: vnode.indexState }, vnode.key)
    } else {
      // I guess this would also be creating a new container for the index
      this.templateVNode.args = { item: vnode.key, index: vnode.indexState }
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

      // console.log("Patching at index", oldHead, newHead)
      this.patch(oldVKids[oldHead++], newVKids[newHead++])
    }

    // now check from the end
    while (newHead <= newTail && oldHead <= oldTail) {
      if (getKey(oldVKids[oldTail]) !== getKey(newVKids[newTail])) {
        break
      }

      // console.log("Patching an element from the end")
      this.patch(oldVKids[oldTail--], newVKids[newTail--])
    }

    if (oldHead > oldTail) {
      // then we got through everything old and we are adding new children to the beginning
      const firstNode = oldVKids[oldHead]?.node ?? this.listStartNode
      while (newHead <= newTail) {
        const newVKid = newVKids[newHead]
        // console.log("Creating new node", newVKid.actualIndex, newVKid.indexState)
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
        this.patch(oldVKid, newVKid)
        newKeyed.add(newKey)
        oldHead++
      } else {
        const tmpVKid = keyed.get(newKey)
        if (tmpVKid !== undefined) {
          // we're reordering keyed elements -- first move the element to the right place
          tmpVKid.node = parent.insertBefore(tmpVKid.node!, (oldVKid && oldVKid.node) ?? this.listStartNode)
          // then patch it -- Note that patching sets the node on the newVKid
          this.patch(tmpVKid, newVKid)
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

  patch(oldVNode: VirtualListItem, newVNode: VirtualListItem): VirtualListItem {
    // here I think we would need to update the index container somehow because
    // we have the old index and the new index and if they don't match then
    // we need to update the new vnode's index container with the new index?
    // we do have access to the store so we'd need to write to the index container
    // here I guess -- if it changes?
    // I'd somehow like to only create the index container if it's necessary also -- like
    // if some reactive effect actually tries to get its value ... and then only
    // some VirtualListItems would actually have a index container I guess?
    newVNode.node = oldVNode.node
    // console.log("oldVNode", oldVNode.node, oldVNode.indexState)
    // newVNode.index = oldVNode.index

    if (this.vnode.template.usesIndex) {
      //@ts-ignore
      this.store.dispatch(write(oldVNode.indexState, newVNode.actualIndex))
      // ^^^^ Note thah we do have access to the ZoneListTemplate so we could
      // get a reference to the actual reactive variable and set the value directly
      // instead of creating a message and dispatching to the store ...

      newVNode.indexState = oldVNode.indexState
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

