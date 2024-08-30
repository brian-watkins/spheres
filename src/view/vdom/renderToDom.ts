import { Store } from "../../store/index.js";
import { DOMRenderer } from "./render.js";
import { NodeType, VirtualNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "./virtualNode.js";
import { EventHandler } from "./eventHandler.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { createTemplateInstance } from "./template.js";
import { ZoneEffect } from "./effects/zoneEffect.js";
import { ListEffect } from "./effects/listEffect.js";

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
    const rootNode = createNode(store, node)
    element.parentNode?.replaceChild(rootNode, element)
    return {
      type: "element-root",
      root: rootNode
    }
  }
}

export function createNode(store: Store, vnode: VirtualNode): Node {
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
      const query = new ZoneEffect(store, undefined, vnode.generator, vnode)
      store.useEffect(query)
      return query.node
    }

    // Note this does not seem to be used by anything anymore
    case NodeType.TEMPLATE:
      return createTemplateInstance(store, vnode)

    case NodeType.ZONE_LIST:
      const listStartNode = document.createComment(`template-list-${vnode.id}`)
      const parentFrag = document.createDocumentFragment()
      parentFrag.appendChild(listStartNode)
      const effect = new ListEffect(store, vnode, listStartNode, createTemplateInstance)
      store.useEffect(effect)
      return parentFrag

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
        const attributeEffect = new UpdateAttributeEffect(element, attr, stateful.generator)
        const handle = store.useEffect(attributeEffect)
        stateful.effect = handle
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
        const handle = store.useEffect(propertyEffect)
        stateful.effect = handle
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
