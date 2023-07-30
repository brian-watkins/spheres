import { Store } from "state-party";
import { DOMRenderer } from "./render.js";
import { ElementNode, FragmentNode, NodeType, VirtualNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "./virtualNode.js";


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
    if (rootNode.type === NodeType.FRAGMENT) {
      return {
        type: "fragment-root",
        root: fragmentParent(rootNode)
      }
    } else {
      return {
        type: "element-root",
        root: rootNode.node!
      }
    }
  }
}

const createNode = (store: Store, vnode: VirtualNode): Node => {
  let node: Node
  switch (vnode.type) {
    case NodeType.TEXT:
      return document.createTextNode(vnode.value)
    case NodeType.STATEFUL:
      let statefulNode: VirtualNode | null = null
      console.log("CREATING STATEFUL NODE!")
      vnode.unsubscribe = store.query(vnode.generator, (update) => {
        console.log("PATCHING STATEFUL NODE!!")
        statefulNode = patch(store, statefulNode, update)
      })
      console.log("Returning stateful node on create", statefulNode!.node)
      return statefulNode!.node!
    case NodeType.ELEMENT:
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
      // looks like in hyperapp there's only one event listener and
      // you just attach it to the node or remove it with the appropriate
      // event type. And somehow maybe it calls the event handler function
      // on the virtual node? not sure ...

      // need to create any properties and event listeners too
      node = element
      break
    case NodeType.FRAGMENT:
      node = document.createDocumentFragment()
      break
    // : (isSvg = isSvg || vdom.tag === "svg")
    // ? document.createElementNS(SVG_NS, vdom.tag, props.is && props)
  }

  for (var i = 0; i < vnode.children.length; i++) {
    const child = vnode.children[i]
    console.log("Creating child", child)
    const childNode = createNode(store, child)
    child.node = childNode
    console.log("Child node type", child.type, childNode.nodeType)
    node.appendChild(childNode)
  }

  // vnode.node = node
  return node
}

const alertRemoval = (vnode: VirtualNode) => {
  if (vnode.type === NodeType.STATEFUL) {
    console.log("Unsubscribing stateful node!")
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

// const patchProperty = ()

// var patchPropertyHH = (node, key, oldValue, newValue, listener, isSvg) => {
//   if (key === "style") {
//     for (var k in { ...oldValue, ...newValue }) {
//       oldValue = newValue == null || newValue[k] == null ? "" : newValue[k]
//       if (k[0] === "-") {
//         node[key].setProperty(k, oldValue)
//       } else {
//         node[key][k] = oldValue
//       }
//     }
//   } else if (key[0] === "o" && key[1] === "n") {
//     if (
//       !((node.events || (node.events = {}))[(key = key.slice(2))] = newValue)
//     ) {
//       node.removeEventListener(key, listener)
//     } else if (!oldValue) {
//       node.addEventListener(key, listener)
//     }
//   } else if (!isSvg && key !== "list" && key !== "form" && key in node) {
//     node[key] = newValue == null ? "" : newValue
//   } else if (newValue == null || newValue === false) {
//     node.removeAttribute(key)
//   } else {
//     node.setAttribute(key, newValue)
//   }
// }

const getKey = (vnode: VirtualNode | undefined) => {
  if (vnode && (vnode.type === NodeType.ELEMENT || vnode.type === NodeType.STATEFUL)) {
    return vnode.key
  } else {
    return undefined
  }
}

// Could oldVNode be null or undefined? Yes
export const patch = (store: Store, oldVNode: VirtualNode | null, newVNode: VirtualNode): VirtualNode => {
  console.log("vnodes", oldVNode, newVNode)
  if (oldVNode === newVNode) {
    console.log("Equal??")
    return oldVNode
  }

  if (oldVNode === null) {
    // note this is modifying the input variable
    newVNode.node = createNode(store, newVNode)
    return newVNode
  }

  let node = oldVNode.node!
  let parent = node.parentNode!

  // if text node exists and has changed
  if (
    oldVNode.type === NodeType.TEXT &&
    newVNode.type === NodeType.TEXT &&
    oldVNode.value !== newVNode.value!
  ) {
    console.log("Patching text!")
    node.nodeValue = newVNode.value!
    // note modifying the input variable
    newVNode.node = node
    return newVNode
  }

  // if this is a totally new node type
  if (oldVNode.type !== newVNode.type) {
    const newNode = createNode(store, newVNode)
    if (oldVNode.type === NodeType.FRAGMENT) {
      const fragParent = fragmentParent(oldVNode)
      newVNode.node = fragParent.insertBefore(newNode, firstChild(oldVNode) ?? null)
      // need to remove all the fragment nodes ...
      for (let i = 0; i < oldVNode.children.length; i++) {
        removeNode(fragParent, oldVNode.children[i])
      }
    } else {
      newVNode.node = parent.insertBefore(newNode, node)
      removeNode(parent, oldVNode)
    }

    return newVNode
  }

  if (oldVNode.type === NodeType.STATEFUL && newVNode.type === NodeType.STATEFUL) {
    console.log("Ignoring stateful nodes", oldVNode)
    // note: modifying the input variable *** CONSIDER A TEST FOR THIS?!
    newVNode.node = oldVNode.node
    return newVNode
    // return oldVNode
  }

  // maybe here if both are fragments we just call patchChildren
  // and for element we check the tag and if it's the same then we call patchChildren
  if (oldVNode.type === NodeType.FRAGMENT && newVNode.type === NodeType.FRAGMENT) {
    console.log("Patching fragments!")
    patchChildren(store, fragmentParent(oldVNode), lastChild(oldVNode)?.nextSibling ?? null, oldVNode, newVNode)
  }

  if (oldVNode.type === NodeType.ELEMENT && newVNode.type === NodeType.ELEMENT) {
    if (oldVNode.tag !== newVNode.tag) {
      // note this updates the node of the element ... but any
      // child nodes are not updated with their nodes
      console.log("Creating new node with different element tag", oldVNode.tag, newVNode.tag)
      newVNode.node = parent.insertBefore(createNode(store, newVNode), node)
      // Note that this removes the node and all its children ... but if one
      // of those is stateful then we need to tell it to unsubscribe ...
      // parent.removeChild(node)
      removeNode(parent, oldVNode)
      return newVNode
    } else {
      // handle the attributes (need to also do props and event handlers)
      for (let i in { ...oldVNode.data.attrs, ...newVNode.data.attrs }) {
        if (oldVNode.data.attrs[i] !== newVNode.data.attrs[i]) {
          if (newVNode.data.attrs[i] === undefined) {
            (node as Element).removeAttribute(i)
          } else {
            (node as Element).setAttribute(i, newVNode.data.attrs[i])
          }
        }
      }

      // handle events
      let i: keyof HTMLElementEventMap
      console.log("*** EVENTS", oldVNode.data.on, newVNode.data.on)
      for (i in { ...oldVNode.data.on, ...newVNode.data.on }) {
        console.log("*** Checking EVENT", i)
        if (newVNode.data.on[i] === undefined) {
          oldVNode.node?.removeEventListener(i, oldVNode.data.on[i]!)
        } else if (oldVNode.data.on[i] === undefined) {
          oldVNode.node?.addEventListener(i, newVNode.data.on[i]!)
        }
      }

      patchChildren(store, node, null, oldVNode, newVNode)
    }
  }

  newVNode.node = node
  return newVNode
}

function fragmentParent(fragment: FragmentNode): Node {
  return fragment.children[0].node?.parentNode!
}

function firstChild(fragment: FragmentNode): Node | undefined {
  // what if there are no children in the fragment?
  return fragment.children[0].node
}

function lastChild(fragment: FragmentNode): Node | undefined {
  return fragment.children[fragment.children.length - 1].node
}

function patchChildren(store: Store, parentNode: Node, nextSibling: Node | null, oldVNode: ElementNode | FragmentNode, newVNode: ElementNode | FragmentNode) {
  console.log("Patching children")
  // need to handle children
  let oldKey
  let newKey
  var tmpVKid
  let oldVKid

  let oldVKids = oldVNode.children
  let newVKids = newVNode.children

  let oldHead = 0
  let newHead = 0
  let oldTail = oldVKids.length - 1
  let newTail = newVKids.length - 1

  console.log("Old head tail", oldHead, oldTail)
  console.log("New head tail", newHead, newTail)

  // go through from head to tail and if the keys are the
  // same then I guess position is the same so just patch the node
  // until old or new runs out
  while (newHead <= newTail && oldHead <= oldTail) {
    // if there is no key or there are no old kids
    // or the keys do not match then break
    if (
      (oldKey = getKey(oldVKids[oldHead])) == undefined ||
      oldKey !== getKey(newVKids[newHead])
    ) {
      console.log("Breaking because keys are not the same", oldKey, getKey(newVKids[newHead]))
      break
    }

    // patch and try the next element
    patch(
      store,
      oldVKids[oldHead++],
      newVKids[newHead++],
    )
  }

  // Not sure why we have this?
  // now newHead or oldHead is at the end so it would be false if you
  // got through the above. But if you break early then you could be here
  while (newHead <= newTail && oldHead <= oldTail) {
    if (
      (oldKey = getKey(oldVKids[oldTail])) == undefined ||
      oldKey !== getKey(newVKids[newTail])
    ) {
      console.log("Breaking because keys are not the same 2", oldKey, getKey(newVKids[newHead]))
      break
    }

    patch(
      store,
      oldVKids[oldTail--],
      newVKids[newTail--],
    )
  }

  console.log("After end checks; Old head tail", oldHead, oldTail)
  console.log("After end checks; New head tail", newHead, newTail)

  if (oldHead > oldTail) {
    // console.log("Old head tail", oldHead, oldTail)
    //   // then we got through everything old and we are adding new
    //   // children to the end?

    while (newHead <= newTail) {
      console.log("New head tail", newHead, newTail)
      //     // but in order for this to insert at the end then the
      //     // second arg to insertBefore needs to be null.
      // node.insertBefore(
      // createNode(
      // (newVKids[newHead] = newVKids[newHead++]),
      // ),
      // ((oldVKid = oldVKids[oldHead]) && oldVKid.node) ?? null
      // )
      const newKid = newVKids[newHead]
      newKid.node = parentNode.insertBefore(createNode(store, newKid), null)
      newHead++
    }
  } else if (newHead > newTail) {
    console.log("Removing nodes at the end", newHead, newTail)
    //   // then there are more old kids than new ones and we got through
    //   // everything so remove from the end of the list
    while (oldHead <= oldTail) {
      // node.removeChild(oldVKids[oldHead++].node!)
      removeNode(parentNode, oldVKids[oldHead++])
    }
  } else {
    let keyed = {} as any
    let newKeyed = {} as any

    // store the old nodes by key (if defined)
    for (let i = oldHead; i <= oldTail; i++) {
      if ((oldKey = getKey(oldVKids[i])) != undefined) {
        keyed[oldKey] = oldVKids[i]
      }
    }

    console.log("Keyed", keyed)

    // go through remaining new children and check keys
    while (newHead <= newTail) {
      console.log("looping over new", newHead, newTail)

      // if the fragment is empty
      const oldKid = oldVKids[oldHead]
      if (oldKid !== undefined) {
        if (oldKid.type === NodeType.FRAGMENT) {
          if (oldKid.children.length === 0) {
            console.log("SKIPPING EMPTY DOC FRAGMENT")
            oldHead++
          }
        }
      }

      // may need to set oldVKid here
      oldVKid = oldVKids[oldHead]
      oldKey = getKey(oldVKid)
      // newKey = getKey((newVKids[newHead] = newVKids[newHead]))
      newKey = getKey(newVKids[newHead])

      console.log("Checking keys", oldKey, newKey)

      // somehow seems to be checking if a keyed node
      // needs to be removed? but not sure
      // the newKeyed[oldKey] thing might be a check to see if we've
      // already seen that keyed node in the list, if so, then we've already
      // added it (a new version of it) and should remove the old node? 
      if (
        //   // note oldKey seems like it could be null according to below conditional ...
        newKeyed[oldKey!] ||
        (newKey != null && newKey === getKey(oldVKids[oldHead + 1]))
      ) {
        // Maybe this would happen if you are adding new keyed nodes?
        // But the existing nodes were not keyed?
        if (oldKey == null) {
          // This can happen because text nodes are interspersed and
          // being removed
          console.log("**** removing node because oldKey is null")
          // node.removeChild(oldVKid.node!)
          removeNode(parentNode, oldVKid)
        }
        console.log("just skipping", oldHead, oldKey)
        oldHead++
        continue
      }

      // there's a check here in case you are the root element? 
      if (newKey == undefined) {
        console.log("A")
        if (oldKey == undefined) {
          if (oldVKid === undefined) {
            console.log("No old kid, inserting new", oldVNode.type, newVKids[newHead])
            // this is adding at the 'end' of the parent. But it could be a document
            // fragment.
            // so we insert at the nextSibling passed in
            newVKids[newHead].node = parentNode.insertBefore(createNode(store, newVKids[newHead]), nextSibling)
          } else {
            patch(
              store,
              oldVKid,
              newVKids[newHead],
            )
            console.log("Done with patch")
          }
          newHead++
        }
        oldHead++
      } else {
        console.log("B")
        if (oldKey === newKey) {
          console.log("Keys are the same")
          // then these are in the correct position
          // so just patch
          patch(
            store,
            oldVKid,
            newVKids[newHead],
          )
          // save that we have seen this key?
          newKeyed[newKey] = true
          oldHead++
        } else {
          console.log("C")
          tmpVKid = keyed[newKey]
          if (tmpVKid != null) {
            tmpVKid.node = parentNode.insertBefore(tmpVKid.node, (oldVKid && oldVKid.node) ?? null)
            patch(
              store,
              tmpVKid,
              newVKids[newHead],
            )
            newKeyed[newKey] = true
          } else {
            console.log("hello")
            //   // NEED to handle this case
            //   // patch(
            //   //   node,
            //   //   oldVKid && oldVKid.node,
            //   //   null,
            //   //   newVKids[newHead],
            //   // )
            newVKids[newHead].node = parentNode.insertBefore(createNode(store, newVKids[newHead]), (oldVKid && oldVKid.node) ?? null)
          }
        }
        newHead++
      }
    }

    // this is removing extra nodes at the end
    while (oldHead <= oldTail) {
      console.log("Removing extra node at the end")
      if (getKey((oldVKid = oldVKids[oldHead++])) == undefined) {
        // node.removeChild(oldVKid.node!)
        removeNode(parentNode, oldVKid)
      }
    }

    // and this is removing extra nodes in the middle?
    for (let i in keyed) {
      console.log("Checking key", i)
      // like if there was a keyed child in the old node
      // and we never encountered it in the new node
      if (newKeyed[i] == undefined) {
        console.log("Removing keyed node")
        // node.removeChild(keyed[i].node)
        removeNode(parentNode, keyed[i])
      }
    }

  }
}