import { Store } from "state-party";
import { DOMRenderer } from "./render.js";
import { NodeType, VirtualNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "./virtualNode.js";

type PatchFunction = (current: VirtualNode, updated: VirtualNode) => VirtualNode


function createPatch(store: Store): PatchFunction {
  return (current, updated) => {
    return updated
  }
}

function virtualize(element: Node): VirtualNode {
  if (element.nodeType === NodeType.TEXT) {
    return makeVirtualTextNode(element.nodeValue!, element)
  } else {
    let children: Array<VirtualNode> = []
    element.childNodes.forEach((child) => {
      children.push(virtualize(child))
    })

    return makeVirtualElement(element.nodeName.toLowerCase(), virtualNodeConfig(), children, element)
  }
}

export function createDOMRenderer(): DOMRenderer {
  // const patch = createPatch(store)
  return (element, node) => {
    const rootNode = patch(virtualize(element), node)
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

var createNode = (vnode: VirtualNode): Node => {
  let node: Node
  switch (vnode.type) {
    case NodeType.TEXT:
      return document.createTextNode(vnode.value)
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
    node.appendChild(createNode(vnode.children[i]))
  }

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
  if (vnode && vnode.type === NodeType.ELEMENT) {
    return vnode.key
  } else {
    return undefined
  }
}

// Could oldVNode be null or undefined? Yes
const patch = (oldVNode: VirtualNode, newVNode: VirtualNode): VirtualNode => {
  console.log("vnodes", oldVNode, newVNode)
  if (oldVNode === newVNode) {
    return oldVNode
  }

  let node = oldVNode.node!
  let parent = node.parentNode!

  // if text node exists and has changed
  if (
    oldVNode.type === NodeType.TEXT &&
    newVNode.type === NodeType.TEXT &&
    oldVNode.value !== newVNode.value!
  ) {
    node.nodeValue = newVNode.value!
    newVNode.node = node
    return newVNode
  }

  // if this is a totally new node type
  if (oldVNode.type !== newVNode.type) {
    const newNode = createNode(newVNode)
    node = parent.insertBefore(newNode, node)
    newVNode.node = newNode
    parent.removeChild(oldVNode.node!)
    return newVNode
  }

  if (oldVNode.type === NodeType.ELEMENT && newVNode.type === NodeType.ELEMENT) {
    if (oldVNode.tag !== newVNode.tag) {
      newVNode.node = parent.insertBefore(createNode(newVNode), node)
      parent.removeChild(oldVNode.node!)
      return newVNode
    } else {
      // handle the attributes (need to also do props and event handlers)
      for (var i in { ...oldVNode.data.attrs, ...newVNode.data.attrs }) {
        if (oldVNode.data.attrs[i] !== newVNode.data.attrs[i]) {
          if (newVNode.data.attrs[i] == null) {
            (node as Element).removeAttribute(i)
          } else {
            (node as Element).setAttribute(i, newVNode.data.attrs[i])
          }
        }
      }

      // need to handle children
      // var oldKey
      // var newKey
      // var tmpVKid
      var oldVKid

      var oldVKids = oldVNode.children
      var newVKids = newVNode.children

      var oldHead = 0
      var newHead = 0
      var oldTail = oldVKids.length - 1
      var newTail = newVKids.length - 1

      // go through from head to tail and if the keys are the
      // same then I guess position is the same so just patch the node
      // until old or new runs out
      // while (newHead <= newTail && oldHead <= oldTail) {
      //   // if there is no key or there are no old kids
      //   // or the keys do not match then break
      //   if (
      //     (oldKey = getKey(oldVKids[oldHead])) == undefined ||
      //     oldKey !== getKey(newVKids[newHead])
      //   ) {
      //     break
      //   }

      //   // patch and try the next element
      //   patch(
      //     oldVKids[oldHead++],
      //     newVKids[newHead++],
      //   )
      // }

      // now newHead or oldHead is at the end so it would be false if you
      // got through the above. But if you break early then you could be here
      // while (newHead <= newTail && oldHead <= oldTail) {
      //   if (
      //     (oldKey = getKey(oldVKids[oldTail])) == undefined ||
      //     oldKey !== getKey(newVKids[newTail])
      //   ) {
      //     break
      //   }

      //   patch(
      //     oldVKids[oldTail--],
      //     newVKids[newTail--],
      //   )
      // }

      if (oldHead > oldTail) {
        console.log("Old head tail", oldHead, oldTail)
      //   // then we got through everything old and we are adding new
      //   // children to the end?
        while (newHead <= newTail) {
          console.log("New head tail", newHead, newTail)
      //     // but in order for this to insert at the end then the
      //     // second arg to insertBefore needs to be null.
          node.insertBefore(
            createNode(
              (newVKids[newHead] = newVKids[newHead++]),
            ),
            ((oldVKid = oldVKids[oldHead]) && oldVKid.node) ?? null
          )
        }
      }
      // } else if (newHead > newTail) {
      //   // then there are more old kids than new ones and we got through
      //   // everything so remove from the end of the list
      //   while (oldHead <= oldTail) {
      //     node.removeChild(oldVKids[oldHead++].node!)
      //   }
      // } else {
        // let keyed = {} as any
        // let newKeyed = {} as any

        // map the old nodes by key (if defined)
        // for (let i = oldHead; i <= oldTail; i++) {
        //   if ((oldKey = getKey(oldVKids[i])) != undefined) {
        //     keyed[oldKey] = oldVKids[i]
        //   }
        // }

        // go through remaining new children and check keys
        // while (newHead <= newTail) {
          // oldKey = getKey((oldVKid = oldVKids[oldHead]))
          // newKey = getKey((newVKids[newHead] = newVKids[newHead]))

          // somehow seems to be checking if a keyed node
          // needs to be removed? but not sure
          // the newKeyed[oldKey] thing might be a check to see if we've
          // already seen that keyed node in the list, if so, then we've already
          // added it (a new version of it) and should remove the old node? 
          // if (
          //   // note oldKey seems like it could be null according to below conditional ...
          //   newKeyed[oldKey!] ||
          //   (newKey != null && newKey === getKey(oldVKids[oldHead + 1]))
          // ) {
          //   if (oldKey == null) {
          //     node.removeChild(oldVKid.node!)
          //   }
          //   oldHead++
          //   continue
          // }

          // if (newKey == undefined || oldVNode.type === NodeType.ELEMENT) {
          //   if (oldKey == undefined) {
          //     patch(
          //       oldVKid,
          //       newVKids[newHead],
          //     )
          //     newHead++
          //   }
          //   oldHead++
          // } else {
            // if (oldKey === newKey) {
              // then these are in the correct position
              // so just patch
              // patch(
                // oldVKid,
                // newVKids[newHead],
              // )
              // save that we have seen this key?
              // newKeyed[newKey] = true
              // oldHead++
            // } else {
              // if ((tmpVKid = keyed[newKey]) != null) {
                // tmpVKid.node = node.insertBefore(tmpVKid.node, (oldVKid && oldVKid.node) ?? null)
                // patch(
                  // tmpVKid,
                  // newVKids[newHead],
                // )
                // newKeyed[newKey] = true
              // } else {
                // NEED to handle this case
                // patch(
                //   node,
                //   oldVKid && oldVKid.node,
                //   null,
                //   newVKids[newHead],
                // )
              // }
            // }
            // newHead++
          // }
        // }

        // this is maybe removing extra nodes at the end
        // while (oldHead <= oldTail) {
          // if (getKey((oldVKid = oldVKids[oldHead++])) == undefined) {
            // node.removeChild(oldVKid.node!)
          // }
        // }

        // and this is removing extra nodes in the middle?
        // for (var i in keyed) {
          // like if there was a keyed child in the old node
          // and we never encountered it in the new node
          // if (newKeyed[i] == undefined) {
            // node.removeChild(keyed[i].node)
          // }
        // }
      // }

      newVNode.node = node
      return newVNode
    }
  }

  return oldVNode
}
