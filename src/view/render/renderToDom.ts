import { Store } from "../../store/index.js";
import { DOMEvent, EventsToDelegate, RenderResult, spheresTemplateData, Zone } from "./index.js";
import { NodeType, StoreEventHandler, VirtualNode } from "./virtualNode.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { ListEffect } from "./effects/listEffect.js";
import { IdSequence } from "./idSequence.js";
import { getDOMTemplate } from "./template.js";
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId, listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers.js";
import { getEventAttribute, getNearestElementHandlingEvent, setEventAttribute } from "./eventHelpers.js";
import { SelectViewEffect } from "./effects/selectViewEffect.js";

export class DOMRoot implements Zone, RenderResult {
  private activeDocumentEvents = new Set<string>()
  private eventController = new AbortController()
  private events: Map<string, DOMEvent> = new Map()

  constructor(readonly store: Store, readonly root: Element) { }

  mount(vnode: VirtualNode) {
    this.clearRoot()
    this.root.appendChild(createNode(this, this.store, new IdSequence(), vnode))
  }

  activate(vnode: VirtualNode) {
    this.cleanRoot()
    activateEffects(this, this.store, vnode, this.root.firstChild!)
  }

  addEvent(location: DOMEvent["location"], elementId: string, eventType: string, handler: StoreEventHandler<any>) {
    this.setupEventHandler(eventType)
    this.events.set(`${eventType}-${elementId}`, { location, handler })
  }

  private setupEventHandler(eventType: string) {
    if (this.activeDocumentEvents.has(eventType)) return

    this.root.addEventListener(
      eventType,
      this.createEventListener(eventType),
      { signal: this.eventController.signal }
    )

    this.activeDocumentEvents.add(eventType)
  }

  private createEventListener(eventType: string) {
    return (evt: Event) => {
      const targetElement = evt.target as Element
      const element = getNearestElementHandlingEvent(targetElement, eventType)
      if (element) {
        const elementId = getEventAttribute(element, eventType)
        const domEvent = this.events.get(`${eventType}-${elementId}`)
        switch (domEvent?.location) {
          case "element":
            this.store.dispatch(domEvent.handler(evt))
            break
          case "template":
            const root = element.closest(`[data-spheres-template]`)!
            // @ts-ignore
            const zoneStore = root[spheresTemplateData]
            zoneStore.dispatch(domEvent.handler(evt))
            break
        }
        evt.stopPropagation()
      }
    }
  }

  unmount() {
    this.eventController.abort()
    this.clearRoot()
  }

  private clearRoot() {
    while (this.root.hasChildNodes()) {
      this.root.removeChild(this.root.lastChild!)
    }
  }

  private cleanRoot() {
    for (let i = 0; i < this.root.childNodes.length; i++) {
      const node = this.root.childNodes[i]
      if (node.nodeType === NodeType.TEXT && node.nodeValue?.trim() === "") {
        this.root.removeChild(node)
      } else {
        break
      }
    }
  }
}

export function createNode(zone: Zone, store: Store, idSequence: IdSequence, vnode: VirtualNode): Node {
  switch (vnode.type) {

    case NodeType.TEXT:
      return document.createTextNode(vnode.value)

    case NodeType.STATEFUL_TEXT: {
      const textNode = document.createTextNode("")
      const textEffect = new UpdateTextEffect(textNode, vnode.generator)
      store.useEffect(textEffect)
      return textNode
    }

    case NodeType.STATEFUL_SELECTOR: {
      vnode.id = idSequence.next
      const fragment = document.createDocumentFragment()
      let startNode = document.createComment(switchStartIndicator(vnode.id))
      let endNode = document.createComment(switchEndIndicator(vnode.id))
      fragment.appendChild(startNode)
      fragment.appendChild(endNode)

      const query = new SelectViewEffect(zone, store, vnode, startNode, endNode, getDOMTemplate)
      store.useEffect(query)
      return fragment
    }

    case NodeType.STATEFUL_LIST:
      vnode.id = idSequence.next
      const listStartNode = document.createComment(listStartIndicator(vnode.id))
      const listEndNode = document.createComment(listEndIndicator(vnode.id))
      const parentFrag = document.createDocumentFragment()
      parentFrag.appendChild(listStartNode)
      parentFrag.appendChild(listEndNode)

      const effect = new ListEffect(zone, store, vnode, listStartNode, listEndNode, getDOMTemplate)
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
      const elementId = idSequence.next
      for (const k in events) {
        if (EventsToDelegate.has(k)) {
          setEventAttribute(element, k, elementId)
          zone.addEvent("element", elementId, k, events[k])
        } else {
          const handler = events[k]
          element.addEventListener(k, (evt) => {
            store.dispatch(handler(evt))
          })
        }
      }

      for (var i = 0; i < vnode.children.length; i++) {
        element.appendChild(createNode(zone, store, idSequence, vnode.children[i]))
      }

      return element
  }
}

function activateEffects(zone: Zone, store: Store, vnode: VirtualNode, node: Node): Node {
  switch (vnode.type) {
    case NodeType.STATEFUL_TEXT: {
      const effect = new UpdateTextEffect(node as Text, vnode.generator)
      store.useEffect(effect)
      return node
    }

    case NodeType.STATEFUL_LIST: {
      vnode.id = getListElementId(node)
      let end = findListEndNode(node, vnode.id)

      const effect = new ListEffect(zone, store, vnode, node, end, getDOMTemplate)
      store.useEffect(effect)
      return end
    }

    case NodeType.STATEFUL_SELECTOR: {
      vnode.id = getSwitchElementId(node)
      let end = findSwitchEndNode(node, vnode.id)

      const effect = new SelectViewEffect(zone, store, vnode, node, end, getDOMTemplate)
      store.useEffect(effect)

      return end
    }

    case NodeType.ELEMENT: {
      const element = node as HTMLElement

      const statefulAttrs = vnode.data.statefulAttrs
      for (const attr in statefulAttrs) {
        const stateful = statefulAttrs[attr]
        const attributeEffect = new UpdateAttributeEffect(element, attr, stateful.generator)
        const handle = store.useEffect(attributeEffect)
        stateful.effect = handle
      }

      const statefulProps = vnode.data.statefulProps
      for (const prop in statefulProps) {
        const stateful = statefulProps[prop]
        const propertyEffect = new UpdatePropertyEffect(element, prop, stateful.generator)
        const handle = store.useEffect(propertyEffect)
        stateful.effect = handle
      }

      const elementEvents = vnode.data.on
      for (const k in elementEvents) {
        if (EventsToDelegate.has(k)) {
          const elementId = getEventAttribute(element, k)
          zone.addEvent("element", elementId, k, elementEvents[k])
        } else {
          const handler = elementEvents[k]
          element.addEventListener(k, (evt) => {
            store.dispatch(handler(evt))
          })
        }
      }

      let childNode = element.firstChild
      for (var i = 0; i < vnode.children.length; i++) {
        const lastChild = activateEffects(zone, store, vnode.children[i], childNode!)
        childNode = lastChild.nextSibling
      }

      return node
    }

    default: {
      return node
    }
  }
}
