import { Store } from "state-party";
import { DOMRenderer } from "./render.js";
import { NodeType, VirtualNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "./virtualNode.js";

type PatchFunction = (current: VirtualNode, updated: VirtualNode) => VirtualNode


function createPatch(store: Store): PatchFunction {
  return (current, updated) => {
    return updated
  }
}

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
  // const patch = createPatch(store)
  return (element, node) => {
    const rootNode = patch(store, virtualize(element), node)
    // if (rootNode.elm instanceof DocumentFragment) {
    //   return {
    //     type: "fragment-root",
    //     // @ts-ignore
    //     root: rootNode.elm.parent!
    //   }
    // } else {
    return {
      type: "element-root",
      root: rootNode.node!
    }
    // }
  }
}

var createNode = (store: Store, vnode: VirtualNode): Node => {
  let node: Node
  switch (vnode.type) {
    case NodeType.TEXT:
      return document.createTextNode(vnode.value)
    case NodeType.STATEFUL:
      let statefulNode: VirtualNode | null = null
      console.log("CREATING STATEFUL NODE!")
      store.query(vnode.generator, (update) => {
        console.log("hello!!")
        // node = createNode(store, update)
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
    const childNode = createNode(store, vnode.children[i])
    vnode.children[i].node = childNode
    node.appendChild(childNode)
  }

  // vnode.node = node
  return node
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
    newVNode.node = node
    return newVNode
  }

  // if this is a totally new node type
  if (oldVNode.type !== newVNode.type) {
    const newNode = createNode(store, newVNode)
    newVNode.node = parent.insertBefore(newNode, node)
    parent.removeChild(node)
    return newVNode
  }

  if (oldVNode.type === NodeType.STATEFUL && newVNode.type === NodeType.STATEFUL) {
    console.log("Ignoring stateful nodes")
    return oldVNode
  }

  if (oldVNode.type === NodeType.ELEMENT && newVNode.type === NodeType.ELEMENT) {
    if (oldVNode.tag !== newVNode.tag) {
      // note this updates the node of the element ... but any
      // child nodes are not updated with their nodes
      newVNode.node = parent.insertBefore(createNode(store, newVNode), node)
      parent.removeChild(node)
      return newVNode
    } else {
      // handle the attributes (need to also do props and event handlers)
      for (var i in { ...oldVNode.data.attrs, ...newVNode.data.attrs }) {
        if (oldVNode.data.attrs[i] !== newVNode.data.attrs[i]) {
          if (newVNode.data.attrs[i] === undefined) {
            (node as Element).removeAttribute(i)
          } else {
            (node as Element).setAttribute(i, newVNode.data.attrs[i])
          }
        }
      }

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
          newKid.node = node.insertBefore(createNode(store, newKid), null)
          newHead++
        }
      } else if (newHead > newTail) {
        console.log("Removing nodes at the end", newHead, newTail)
        //   // then there are more old kids than new ones and we got through
        //   // everything so remove from the end of the list
        while (oldHead <= oldTail) {
          node.removeChild(oldVKids[oldHead++].node!)
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
            // if (oldKey == null) {
            // console.log("removing node because oldKey is null")
            // node.removeChild(oldVKid.node!)
            // }
            console.log("just skipping", oldHead)
            oldHead++
            continue
          }

          // there's a check here in case you are the root element? 
          if (newKey == undefined) {
            console.log("A")
            if (oldKey == undefined) {
              if (oldVKid === undefined) {
                console.log("No old kid, inserting new")
                parent.insertBefore(createNode(store, newVNode), node)
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
              if ((tmpVKid = keyed[newKey]) != null) {
                tmpVKid.node = node.insertBefore(tmpVKid.node, (oldVKid && oldVKid.node) ?? null)
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
              }
            }
            newHead++
          }
          // console.log("Just patching ...")
          // patch(store, oldVKids[oldHead++]!, newVKids[newHead++])
          // }
        }

        // this is removing extra nodes at the end
        while (oldHead <= oldTail) {
          console.log("Removing extra node at the end")
          if (getKey((oldVKid = oldVKids[oldHead++])) == undefined) {
            // oldVKid = oldVKids[oldHead++]
            node.removeChild(oldVKid.node!)
          }
        }

        // and this is removing extra nodes in the middle?
        for (var i in keyed) {
          console.log("Checking key", i)
          // like if there was a keyed child in the old node
          // and we never encountered it in the new node
          if (newKeyed[i] == undefined) {
            console.log("Removing keyed node")
            node.removeChild(keyed[i].node)
          }
        }
      }

      newVNode.node = node
      return newVNode
    }
  }

  return oldVNode
}
