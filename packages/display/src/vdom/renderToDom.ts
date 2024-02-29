import { Store } from "@spheres/store";
import { DOMRenderer } from "./render.js";
import { ElementNode, NodeType, TextNode, VirtualNode, VirtualNodeKey, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "./virtualNode.js";
import { EventHandler } from "./eventHandler.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { createTemplateInstance } from "./template.js";
import { PatchZoneEffect } from "./effects/zoneEffect.js";

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
    const virtual = makeVirtualElement(element.nodeName.toLowerCase(), virtualNodeConfig(), children, element as Element)
    virtual.node = element as Element
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

function createNode(store: Store, vnode: VirtualNode): Node {
  switch (vnode.type) {

    case NodeType.TEXT:
      return document.createTextNode(vnode.value)

    case NodeType.STATEFUL_TEXT: {
      const textNode = document.createTextNode("")
      const textEffect = new UpdateTextEffect(textNode, vnode.generator)
      store.useEffect(textEffect)
      return textNode
    }

    case NodeType.STATEFUL: {
      const query = new PatchZoneEffect(store, undefined, vnode.generator)
      store.useEffect(query)
      return query.node!
    }

    case NodeType.BLOCK:
      const blockNode = createNode(store, vnode.generator!())
      vnode.generator = undefined
      return blockNode

    case NodeType.TEMPLATE:
      return createTemplateInstance(store, vnode)

    default:
      const element = vnode.data.namespace ?
        document.createElementNS(vnode.data.namespace, vnode.tag) :
        document.createElement(vnode.tag)

      const attrs = vnode.data.attrs
      for (const attr in attrs) {
        element.setAttribute(attr, attrs[attr])
      }

      const statefulAttrs = vnode.data.statefulAttrs
      for (const attr in statefulAttrs) {
        const stateful = statefulAttrs[attr]
        // If we really want individual elements to have a context then
        // the virtual node needs to have a context property so we
        // can pass it to the effects ...
        const attributeEffect = new UpdateAttributeEffect(element, attr, stateful.generator)
        store.useEffect(attributeEffect)
        stateful.effect = attributeEffect
      }

      const props = vnode.data.props
      for (const prop in props) {
        //@ts-ignore
        element[prop] = props[prop]
      }

      const statefulProps = vnode.data.statefulProps
      for (const prop in statefulProps) {
        const stateful = statefulProps[prop]
        const propertyEffect = new UpdatePropertyEffect(element, prop, stateful.generator)
        store.useEffect(propertyEffect)
        stateful.effect = propertyEffect
      }

      const events = vnode.data.on
      for (const k in events) {
        addEventListener(store, element, k, events![k])
      }

      for (var i = 0; i < vnode.children.length; i++) {
        vnode.children[i].node = element.appendChild(createNode(store, vnode.children[i]))
      }

      return element
  }
}

function addEventListener(store: Store, element: Element, event: string, handler: EventHandler) {
  handler.connect(store)
  element.addEventListener(event, handler)
}

function removeNode(parent: Node, vnode: VirtualNode) {
  parent.removeChild(vnode.node!)
}

function getKey(vnode: VirtualNode | undefined) {
  //@ts-ignore
  return vnode?.key
}

function patchAttributes(oldVNode: ElementNode, newVNode: ElementNode) {
  for (let key in { ...oldVNode.data.attrs, ...newVNode.data.attrs }) {
    const newValue = newVNode.data.attrs[key]
    if (oldVNode.data.attrs[key] !== newValue) {
      if (newValue === undefined) {
        oldVNode.node!.removeAttribute(key)
      } else {
        oldVNode.node!.setAttribute(key, newValue)
      }
    }
  }
}

function patchProperties(oldVNode: ElementNode, newVNode: ElementNode) {
  const oldProps = oldVNode.data.props ?? {}
  const newProps = newVNode.data.props ?? {}
  for (let key in { ...oldProps, ...newProps }) {
    const newValue = newProps[key]
    if (oldProps[key] !== newValue) {
      if (newValue === undefined) {
        (oldVNode.node as any)[key] = ""
      } else {
        (oldVNode.node as any)[key] = newValue
      }
    }
  }
}

function patchStatefulProperties(store: Store, oldVNode: ElementNode, newVNode: ElementNode) {
  const oldProps = oldVNode.data.statefulProps ?? {}
  const newProps = newVNode.data.statefulProps ?? {}
  for (let key in { ...oldProps, ...newProps }) {
    if (newProps[key] === undefined) {
      oldProps[key].effect?.unsubscribe()
      //@ts-ignore
      oldVNode.node![key] = ""
    } else if (oldProps[key] === undefined) {
      const stateful = newProps[key]
      const propertyEffect = new UpdatePropertyEffect(oldVNode.node!, key, stateful.generator)
      store.useEffect(propertyEffect)
      stateful.effect = propertyEffect
    }
  }
}

function patchStatefulAttributes(store: Store, oldVNode: ElementNode, newVNode: ElementNode) {
  const oldAttr = oldVNode.data.statefulAttrs ?? {}
  const newAttr = newVNode.data.statefulAttrs ?? {}
  for (let key in { ...oldAttr, ...newAttr }) {
    if (newAttr[key] === undefined) {
      oldAttr[key].effect?.unsubscribe()
      oldVNode.node!.removeAttribute(key)
    } else if (oldAttr[key] === undefined) {
      const stateful = newAttr![key]
      const attributeEffect = new UpdateAttributeEffect(oldVNode.node!, key, stateful.generator)
      store.useEffect(attributeEffect)
      stateful.effect = attributeEffect
    }
  }
}

function patchEvents(store: Store, oldVNode: ElementNode, newVNode: ElementNode) {
  const oldEvents = oldVNode.data.on ?? {}
  const newEvents = newVNode.data.on ?? {}
  for (const i in { ...oldEvents, ...newEvents }) {
    if (newEvents[i] === undefined) {
      oldVNode.node!.removeEventListener(i, oldEvents[i])
    } else if (oldEvents[i] === undefined) {
      addEventListener(store, oldVNode.node!, i, newEvents[i])
    } else if (oldEvents[i] !== newEvents[i]) {
      oldEvents[i].handler = newEvents[i].handler
      newEvents[i] = oldEvents[i]
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

  // go through from head to tail and if the keys are the
  // same then I guess position is the same so just patch the node
  // until old or new runs out
  while (newHead <= newTail && oldHead <= oldTail) {
    let oldKey = getKey(oldVKids[oldHead])
    if (oldKey === undefined || oldKey !== getKey(newVKids[newHead])) {
      break
    }

    patch(store, oldVKids[oldHead++], newVKids[newHead++])
  }

  // now check from the end
  while (newHead <= newTail && oldHead <= oldTail) {
    let oldKey = getKey(oldVKids[oldTail])
    if (oldKey === undefined || oldKey !== getKey(newVKids[newTail])) {
      break
    }

    patch(store, oldVKids[oldTail--], newVKids[newTail--])
  }

  if (oldHead > oldTail) {
    // then we got through everything old and we are adding new children to the end
    while (newHead <= newTail) {
      const newVKid = newVKids[newHead]
      newVKid.node = parent.insertBefore(createNode(store, newVKid), null)
      newHead++
    }

    return
  }

  if (newHead > newTail) {
    // then there are more old kids than new ones and we got through
    // everything so remove from the end of the list
    while (oldHead <= oldTail) {
      removeNode(parent, oldVKids[oldHead++])
    }
    return
  }

  const keyed = new Map<VirtualNodeKey, VirtualNode>()
  const newKeyed = new Set<VirtualNodeKey>()

  // store the old nodes by key (if defined)
  for (let i = oldHead; i <= oldTail; i++) {
    const oldKey = getKey(oldVKids[i])
    if (oldKey !== undefined) {
      keyed.set(oldKey, oldVKids[i])
    }
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
      (newKey !== undefined && newKey === getKey(oldVKids[oldHead + 1]))
    ) {
      if (oldKey === undefined) {
        removeNode(parent, oldVKid)
      }
      oldHead++
      continue
    }

    const newVKid = newVKids[newHead]
    // there's a check in the original here in case you are the root element? 
    if (newKey === undefined) {
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
      if (oldKey === newKey) {
        // then these are in the correct position so just patch
        // Note that patching sets the node on the newVKid
        patch(store, oldVKid, newVKid)
        newKeyed.add(newKey)
        oldHead++
      } else {
        const tmpVKid = keyed.get(newKey)
        if (tmpVKid !== undefined) {
          // we're reordering keyed elements -- first move the element to the right place
          tmpVKid.node = parent.insertBefore(tmpVKid.node!, (oldVKid && oldVKid.node) ?? null)
          // then patch it -- Note that patching sets the node on the newVKid
          patch(store, tmpVKid, newVKid)
          newKeyed.add(newKey)
        } else {
          // we're adding a new keyed element
          newVKid.node = parent.insertBefore(createNode(store, newVKid), (oldVKid && oldVKid.node) ?? null)
        }
      }
      newHead++
    }
  }

  // this is removing extra nodes at the end
  while (oldHead <= oldTail) {
    const oldVKid = oldVKids[oldHead++]
    if (getKey(oldVKid) === undefined) {
      removeNode(parent, oldVKid)
    }
  }

  // and this is removing extra nodes
  // if there was a keyed child in the old node
  // and we never encountered it in the new node
  for (const i of keyed.keys()) {
    if (!newKeyed.has(i)) {
      removeNode(parent, keyed.get(i)!)
    }
  }
}

//
// NOTE: The algorithm in patch is based on the diffing algorithm found
// in hyperapp https://github.com/jorgebucaran/hyperapp
//

export function patch(store: Store, oldVNode: VirtualNode | null, newVNode: VirtualNode): VirtualNode {
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
      const newElement = newVNode as ElementNode
      if (oldVNode.tag !== newElement.tag) {
        // just replace, don't diff
        newVNode.node = parent.insertBefore(createNode(store, newVNode), node)
        removeNode(parent, oldVNode)
        return newVNode
      } else {
        patchAttributes(oldVNode, newElement)
        if (oldVNode.data.statefulAttrs || newElement.data.statefulAttrs) {
          patchStatefulAttributes(store, oldVNode, newElement)
        }
        if (oldVNode.data.props || newElement.data.props) {
          patchProperties(oldVNode, newElement)
        }
        if (oldVNode.data.statefulProps || newElement.data.statefulProps) {
          patchStatefulProperties(store, oldVNode, newElement)
        }
        if (oldVNode.data.on || newElement.data.on) {
          patchEvents(store, oldVNode, newElement)
        }
        if (!newElement.data.props?.innerHTML && !newElement.data.statefulProps?.innerHTML) {
          patchChildren(store, oldVNode, newElement)
        }
      }
  }

  newVNode.node = node
  return newVNode
}
