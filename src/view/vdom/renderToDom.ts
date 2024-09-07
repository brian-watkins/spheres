import { Store } from "../../store/index.js";
import { TemplateData } from "./render.js";
import { NodeType, StoreEventHandler, VirtualNode, VirtualTemplate, ZoneListNode } from "./virtualNode.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { ZoneEffect } from "./effects/zoneEffect.js";
import { ListEffect } from "./effects/listEffect.js";
import { EffectLocation } from "./effectLocation.js";
import { EffectGenerator } from "./effects/effectGenerator.js";

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
      const query = new ZoneEffect(store, undefined, vnode.generator, createNode)
      store.useEffect(query)
      return query.node
    }

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
        addEventListener(store, element, k, events[k])
      }

      for (var i = 0; i < vnode.children.length; i++) {
        vnode.children[i].node = element.appendChild(createNode(store, vnode.children[i]))
      }

      return element
  }
}

function addEventListener(store: Store, element: Element, event: string, handler: StoreEventHandler<any>) {
  element.addEventListener(event, (evt) => {
    dispatchEventResult(store, handler, evt)
  })
}

function dispatchEventResult(store: Store, handler: StoreEventHandler<any>, evt: Event) {
  const handlerResult = handler(evt)
  if (typeof handlerResult === "function") {
    store.dispatchWith(handlerResult)
  } else {
    store.dispatch(handlerResult)
  }
}


// Template Stuff

const templateRegistry = new WeakMap<VirtualTemplate<any>, DOMTemplate>()

type EventMap = Map<string, StoreEventHandler<any>>

interface DOMTemplate {
  element: HTMLTemplateElement
  effects: Array<EffectTemplate>
  events: Map<string, EventMap>
}

export function createTemplateInstance(store: Store, templateData: TemplateData): Node {
  let template = getTemplate(templateData)

  const root = template.element.content.cloneNode(true)

  for (const effect of template.effects) {
    effect.attach(store, root, templateData.args)
  }

  const rootElement = root.firstChild!
  attachEvents(template, templateData, store, rootElement)

  return rootElement
}

function attachEvents(template: DOMTemplate, templateData: TemplateData, store: Store, rootElement: Node) {
  for (const [eventType, eventMap] of template.events) {
    const args = templateData.args
    const virtualTemplate = templateData.template
    rootElement.addEventListener(eventType, (evt) => {
      const targetElement = evt.target as Element
      const node = targetElement.closest(`[data-spheres-${eventType}]`) as Element
      if (node) {
        const handler = eventMap.get(node.getAttribute(`data-spheres-${eventType}`)!)!

        virtualTemplate.setArgs(args)
        dispatchEventResult(store, handler, evt)

        evt.stopPropagation()
      }
    })
  }
}

function getTemplate(templateData: TemplateData): DOMTemplate {
  let template = templateRegistry.get(templateData.template)

  if (template === undefined) {
    const virtualNode = templateData.template.virtualNode

    const element = document.createElement("template")
    element.content.appendChild(createTemplateNode(virtualNode))

    const eventMap = new Map<string, EventMap>()
    findEvents(eventMap, virtualNode)

    template = {
      element,
      effects: findEffectLocations(templateData.template, virtualNode, new EffectLocation((root) => root.firstChild!)),
      events: eventMap
    }

    templateRegistry.set(templateData.template, template)
  }

  return template
}

interface EffectTemplate {
  attach(store: Store, root: Node, context: any): void
}

class TextEffectTemplate implements EffectTemplate {
  constructor(private generator: EffectGenerator<string | undefined>, private location: EffectLocation) { }

  attach(store: Store, root: Node, props: any) {
    const effect = new UpdateTextEffect(this.location.findNode(root) as Text, this.generator, props)
    store.useEffect(effect)
  }
}

class AttributeEffectTemplate implements EffectTemplate {
  constructor(private generator: EffectGenerator<string | undefined>, private attribute: string, private location: EffectLocation) { }

  attach(store: Store, root: Node, props: any) {
    const effect = new UpdateAttributeEffect(this.location.findNode(root) as Element, this.attribute, this.generator, props)
    store.useEffect(effect)
  }
}

class PropertyEffectTemplate implements EffectTemplate {
  constructor(private generator: EffectGenerator<string | undefined>, private property: string, private location: EffectLocation) { }

  attach(store: Store, root: Node, props: any) {
    const effect = new UpdatePropertyEffect(this.location.findNode(root) as Element, this.property, this.generator, props)
    store.useEffect(effect)
  }
}

class StatefulZoneEffectTemplate implements EffectTemplate {
  constructor(private generator: EffectGenerator<VirtualNode>, private location: EffectLocation) { }

  attach(store: Store, root: Node, props: any) {
    const effect = new ZoneEffect(store, this.location.findNode(root), this.generator, createNode, props)
    store.useEffect(effect)
  }
}

class ListEffectTemplate implements EffectTemplate {
  constructor(private vnode: ZoneListNode, private location: EffectLocation) { }

  attach(store: Store, root: Node, _: any) {
    const listStartIndicatorNode = this.location.findNode(root)
    const effect = new ListEffect(store, this.vnode, listStartIndicatorNode, createTemplateInstance)
    store.useEffect(effect)
  }
}

function findEvents(events: Map<string, EventMap>, vnode: VirtualNode) {
  switch (vnode.type) {
    case NodeType.ELEMENT:
      const elementEvents = vnode.data.on
      for (const k in elementEvents) {
        let map = events.get(k)
        if (map === undefined) {
          map = new Map<string, StoreEventHandler<any>>()
          events.set(k, map)
        }
        map.set(vnode.data.eventId, elementEvents[k])
      }

      for (var i = 0; i < vnode.children.length; i++) {
        findEvents(events, vnode.children[i])
      }
  }
}

function findEffectLocations(template: VirtualTemplate<any>, vnode: VirtualNode, location: EffectLocation): Array<EffectTemplate> {
  switch (vnode.type) {
    case NodeType.TEXT:
      return []

    case NodeType.STATEFUL_TEXT:
      return [new TextEffectTemplate(template.useWithArgs(vnode.generator), location)]

    case NodeType.STATEFUL:
      return [new StatefulZoneEffectTemplate(template.useWithArgs(vnode.generator), location)]

    case NodeType.ZONE_LIST:
      const markerLocation = location.nextCommentSiblingMatching(`zone-list-${vnode.id}`)
      return [new ListEffectTemplate(vnode, markerLocation)]

    case NodeType.ELEMENT:
      let effects: Array<EffectTemplate> = []

      const statefulAttrs = vnode.data.statefulAttrs
      for (const attr in statefulAttrs) {
        effects.push(new AttributeEffectTemplate(template.useWithArgs(statefulAttrs[attr].generator), attr, location))
      }

      const statefulProps = vnode.data.statefulProps
      for (const prop in statefulProps) {
        effects.push(new PropertyEffectTemplate(template.useWithArgs(statefulProps[prop].generator), prop, location))
      }

      for (var i = 0; i < vnode.children.length; i++) {
        location = i === 0 ? location.firstChild() : location.nextSibling()
        effects = effects.concat(findEffectLocations(template, vnode.children[i], location))
      }

      return effects
  }
}

function createTemplateNode(vnode: VirtualNode): Node {
  switch (vnode.type) {
    case NodeType.TEXT:
      return document.createTextNode(vnode.value)

    case NodeType.STATEFUL_TEXT: {
      return document.createTextNode("")
    }

    case NodeType.STATEFUL: {
      return document.createElement("reactive-zone")
    }

    case NodeType.ZONE_LIST:
      return document.createComment(`zone-list-${vnode.id}`)

    default:
      const element = vnode.data.namespace ?
        document.createElementNS(vnode.data.namespace, vnode.tag) :
        document.createElement(vnode.tag)

      const attrs = vnode.data.attrs
      for (const attr in attrs) {
        element.setAttribute(attr, attrs[attr])
      }

      const events = vnode.data.on
      for (const k in events) {
        element.setAttribute(`data-spheres-${k}`, vnode.data.eventId!)
      }

      const props = vnode.data.props
      for (const prop in props) {
        //@ts-ignore
        element[prop] = props[prop]
      }

      for (var i = 0; i < vnode.children.length; i++) {
        vnode.children[i].node = element.appendChild(createTemplateNode(vnode.children[i]))
      }

      return element
  }
}
