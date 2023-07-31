import { Store } from "state-party";
import { DOMRenderer } from "./render.js";
import { ElementNode, NodeType, TextNode, VirtualNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "./virtualNode.js";


export function virtualize(element: Node): VirtualNode {
  if (element.nodeType === NodeType.TEXT) {
    const virtual = makeVirtualTextNode(element.nodeValue!, element)
    virtual.node = element
    return virtual
  } else {
    let children: Array<VirtualNode> = []
    element.childNodes.forEach((child) => {
      children.push(virtualize(child))
    })

    // note that we are not getting the attributes here ... is that
    // because we just use virtualize when mounting an element and we
    // don't care? What about for rehydrating?
    const virtual = makeVirtualElement(element.nodeName.toLowerCase(), virtualNodeConfig(), children, element)
    virtual.node = element
    return virtual
  }
}

export function createDOMRenderer(store: Store): DOMRenderer {
  return (element, node) => {
    const rootNode = patch(store, virtualize(element), node)
    return {
      type: "element-root",
      root: rootNode.node!
    }
  }
}

const createNode = (store: Store, vnode: VirtualNode): Node => {
  if (vnode.type === NodeType.TEXT) {
    return document.createTextNode(vnode.value)
  }

  if (vnode.type === NodeType.STATEFUL) {
    let statefulNode: VirtualNode | null = null
    // console.log("CREATING STATEFUL NODE!")
    vnode.unsubscribe = store.query(vnode.generator, (update) => {
      // console.log("PATCHING STATEFUL NODE!!")
      statefulNode = patch(store, statefulNode, update)
    })
    // console.log("Returning stateful node on create", statefulNode!.node)
    return statefulNode!.node!
  }

  const element = document.createElement(vnode.tag, { is: vnode.is })

  const attrs = vnode.data.attrs
  for (const attr in attrs) {
    element.setAttribute(attr, attrs[attr])
  }

  let k: keyof HTMLElementEventMap
  for (k in vnode.data.on) {
    const handler: any = vnode.data.on[k]
    element.addEventListener(k, handler)
  }

  for (var i = 0; i < vnode.children.length; i++) {
    vnode.children[i].node = element.appendChild(createNode(store, vnode.children[i]))
  }

  return element
}

const alertRemoval = (vnode: VirtualNode) => {
  if (vnode.type === NodeType.STATEFUL) {
    // console.log("Unsubscribing stateful node!")
    vnode.unsubscribe?.()
  } else if (vnode.type === NodeType.ELEMENT) {
    for (const child of vnode.children) {
      alertRemoval(child)
    }
  }
}

const removeNode = (parent: Node, vnode: VirtualNode) => {
  alertRemoval(vnode)
  parent.removeChild(vnode.node!)
}

function getKey(vnode: VirtualNode | undefined) {
  if (vnode && (vnode.type === NodeType.ELEMENT || vnode.type === NodeType.STATEFUL)) {
    return vnode.key
  } else {
    return undefined
  }
}

function patchAttributes(oldVNode: ElementNode, newVNode: ElementNode) {
  for (let i in { ...oldVNode.data.attrs, ...newVNode.data.attrs }) {
    if (oldVNode.data.attrs[i] !== newVNode.data.attrs[i]) {
      if (newVNode.data.attrs[i] === undefined) {
        (oldVNode.node as Element).removeAttribute(i)
      } else {
        (oldVNode.node as Element).setAttribute(i, newVNode.data.attrs[i])
      }
    }
  }
}

function patchEvents(oldVNode: ElementNode, newVNode: ElementNode) {
  let i: keyof HTMLElementEventMap
  // console.log("*** EVENTS", oldVNode.data.on, newVNode.data.on)
  for (i in { ...oldVNode.data.on, ...newVNode.data.on }) {
    // console.log("*** Checking EVENT", i)
    if (newVNode.data.on[i] === undefined) {
      oldVNode.node!.removeEventListener(i, oldVNode.data.on[i]!)
    } else if (oldVNode.data.on[i] === undefined) {
      oldVNode.node!.addEventListener(i, newVNode.data.on[i]!)
    }
  }
}

function patchChildren(store: Store, oldVNode: ElementNode, newVNode: ElementNode) {
  let parent = oldVNode.node!

  let oldVKids = oldVNode.children
  let newVKids = newVNode.children

  let oldHead = 0
  let newHead = 0
  let oldTail = oldVKids.length - 1
  let newTail = newVKids.length - 1

  // console.log("Old head tail", oldHead, oldTail)
  // console.log("New head tail", newHead, newTail)

  // go through from head to tail and if the keys are the
  // same then I guess position is the same so just patch the node
  // until old or new runs out
  while (newHead <= newTail && oldHead <= oldTail) {
    let oldKey = getKey(oldVKids[oldHead])
    if (oldKey === undefined || oldKey !== getKey(newVKids[newHead])) {
      // console.log("Breaking because keys are not the same", oldKey, getKey(newVKids[newHead]))
      break
    }

    patch(store, oldVKids[oldHead++], newVKids[newHead++])
  }

  // Not sure why we have this?
  // now newHead or oldHead is at the end so it would be false if you
  // got through the above. But if you break early then you could be here
  while (newHead <= newTail && oldHead <= oldTail) {
    let oldKey = getKey(oldVKids[oldTail])
    if (oldKey === undefined || oldKey !== getKey(newVKids[newTail])) {
      // console.log("Breaking because keys are not the same 2", oldKey, getKey(newVKids[newHead]))
      break
    }

    patch(store, oldVKids[oldTail--], newVKids[newTail--])
  }

  // console.log("After end checks; Old head tail", oldHead, oldTail)
  // console.log("After end checks; New head tail", newHead, newTail)

  if (oldHead > oldTail) {
    // then we got through everything old and we are adding new children to the end?
    while (newHead <= newTail) {
      // console.log("New head tail", newHead, newTail)
      const newVKid = newVKids[newHead]
      newVKid.node = parent.insertBefore(createNode(store, newVKid), null)
      newHead++
    }

    return
  }

  if (newHead > newTail) {
    // console.log("Removing nodes at the end", newHead, newTail)
    // then there are more old kids than new ones and we got through
    // everything so remove from the end of the list
    while (oldHead <= oldTail) {
      removeNode(parent, oldVKids[oldHead++])
    }
    return
  }

  const keyed = {} as any
  const newKeyed = {} as any

  // store the old nodes by key (if defined)
  for (let i = oldHead; i <= oldTail; i++) {
    const oldKey = getKey(oldVKids[i])
    if (oldKey !== undefined) {
      keyed[oldKey] = oldVKids[i]
    }
  }

  // go through remaining new children and check keys
  while (newHead <= newTail) {
    // console.log("looping over new", newHead, newTail, oldHead, oldTail)
    const oldVKid = oldVKids[oldHead]
    const oldKey = getKey(oldVKid)
    const newKey = getKey(newVKids[newHead])

    // console.log("Checking keys", oldKey, newKey)

    // This kind of seems just like an optimization for list reordering
    // Check if we need to skip or remove the old node
    if (
      newKeyed[oldKey!] ||
      (newKey !== undefined && newKey === getKey(oldVKids[oldHead + 1]))
    ) {
      if (oldKey == null) {
        removeNode(parent, oldVKid)
      }
      oldHead++
      continue
    }

    const newVKid = newVKids[newHead]
    // there's a check here in case you are the root element? 
    if (newKey === undefined) {
      // console.log("A")
      if (oldKey === undefined) {
        if (oldVKid === undefined) {
          // Insert a new unkeyed element because we're at the end of the list of old elements
          newVKid.node = parent.insertBefore(createNode(store, newVKid), null)
        } else {
          // Just patch the old element with the new one
          // Note that patching sets the node on the newVKid
          patch(store, oldVKid, newVKid)
        }
        newHead++
      }
      oldHead++
    } else {
      // console.log("B")
      if (oldKey === newKey) {
        // console.log("Keys are the same")
        // then these are in the correct position so just patch
        // Note that patching sets the node on the newVKid
        patch(store, oldVKid, newVKid)
        newKeyed[newKey] = true
        oldHead++
      } else {
        // console.log("Keys are not the same", oldKey, newKey)
        const tmpVKid = keyed[newKey]
        if (tmpVKid != null) {
          // console.log("moving existing item", newKey)
          // we're reordering keyed elements -- first move the element to the right place
          tmpVKid.node = parent.insertBefore(tmpVKid.node, (oldVKid && oldVKid.node) ?? null)
          // then patch it -- Note that patching sets the node on the newVKid
          patch(store, tmpVKid, newVKid)
          newKeyed[newKey] = true
        } else {
          // we're adding a new keyed element
          // console.log("*** Old vkid", oldVKid)
          newVKid.node = parent.insertBefore(createNode(store, newVKid), (oldVKid && oldVKid.node) ?? null)
        }
      }
      newHead++
    }
  }

  // this is removing extra nodes at the end
  while (oldHead <= oldTail) {
    // console.log("Removing extra node at the end")
    const oldVKid = oldVKids[oldHead++]
    if (getKey(oldVKid) === undefined) {
      removeNode(parent, oldVKid)
    }
  }

  // and this is removing extra nodes in the middle?
  for (let i in keyed) {
    // console.log("Checking key", i)
    // if there was a keyed child in the old node
    // and we never encountered it in the new node
    if (newKeyed[i] === undefined) {
      // console.log("Removing keyed node")
      removeNode(parent, keyed[i])
    }
  }
}

export const patch = (store: Store, oldVNode: VirtualNode | null, newVNode: VirtualNode): VirtualNode => {
  // console.log("vnodes", oldVNode, newVNode)

  if (oldVNode === null) {
    newVNode.node = createNode(store, newVNode)
    return newVNode
  }

  let node = oldVNode.node!
  let parent = node.parentNode!

  if (oldVNode.type !== newVNode.type) {
    // just replace, don't diff
    newVNode.node = parent.insertBefore(createNode(store, newVNode), node)
    removeNode(parent, oldVNode)
    return newVNode
  }

  switch (oldVNode.type) {
    case NodeType.TEXT:
      if (oldVNode.value !== (newVNode as TextNode).value) {
        node.nodeValue = (newVNode as TextNode).value
      }
      break
    case NodeType.ELEMENT:
      if (oldVNode.tag !== (newVNode as ElementNode).tag) {
        // just replace, don't diff
        newVNode.node = parent.insertBefore(createNode(store, newVNode), node)
        removeNode(parent, oldVNode)
        return newVNode
      } else {
        patchAttributes(oldVNode, newVNode as ElementNode)
        patchEvents(oldVNode, newVNode as ElementNode)
        patchChildren(store, oldVNode, newVNode as ElementNode)
      }
  }

  newVNode.node = node
  return newVNode
}
