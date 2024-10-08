import { Store } from "../../store/index.js";
import { DOMEvent, DOMTemplate, EffectTemplate, EventsToDelegate, RenderResult, spheresTemplateData, TemplateData, Zone } from "./render.js";
import { NodeType, StoreEventHandler, VirtualNode, VirtualTemplate, StatefulListNode } from "./virtualNode.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { StatefulViewEffect } from "./effects/statefulViewEffect.js";
import { ListEffect } from "./effects/listEffect.js";
import { EffectLocation } from "./effectLocation.js";
import { EffectGenerator } from "./effects/effectGenerator.js";
import { IdentifierGenerator } from "./idGenerator.js";

export class DOMRoot implements Zone, RenderResult {
  private activeDocumentEvents = new Set<string>()
  private eventController = new AbortController()
  private events: Map<string, DOMEvent> = new Map()

  constructor(readonly store: Store, readonly root: Element) { }

  private clearRoot() {
    while (this.root.hasChildNodes()) {
      this.root.removeChild(this.root.lastChild!)
    }
  }

  mount(vnode: VirtualNode) {
    this.clearRoot()
    this.root.appendChild(createNode(this, new IdentifierGenerator(), vnode))
  }

  activate(vnode: VirtualNode) {
    activateEffects(this, vnode, this.root)
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
      const node = targetElement.closest(`[data-spheres-${eventType}]`) as Element
      if (node) {
        const elementId = node.getAttribute(`data-spheres-${eventType}`)!
        const domEvent = this.events.get(`${eventType}-${elementId}`)
        switch (domEvent?.location) {
          case "element":
            this.store.dispatch(domEvent.handler(evt))
            break
          case "template":
            const root = node.closest(`[data-spheres-template]`)!
            //@ts-ignore
            const templateData: TemplateData = root[spheresTemplateData]
            const virtualTemplate = templateData.template
            // what if this has nested templates? How do we set all the args?
            virtualTemplate.setArgs(templateData.args)
            const message = domEvent.handler(evt)
            this.store.dispatch(message)
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
}

export function createNode(zone: Zone, idGenerator: IdentifierGenerator, vnode: VirtualNode): Node {
  switch (vnode.type) {

    case NodeType.TEXT:
      return document.createTextNode(vnode.value)

    case NodeType.STATEFUL_TEXT: {
      const textNode = document.createTextNode("")
      const textEffect = new UpdateTextEffect(textNode, vnode.generator)
      zone.store.useEffect(textEffect)
      return textNode
    }

    case NodeType.STATEFUL: {
      const query = new StatefulViewEffect(zone, undefined, vnode.generator, createNode)
      zone.store.useEffect(query)
      return query.node
    }

    case NodeType.STATEFUL_LIST:
      vnode.id = idGenerator.next
      const listStartNode = document.createComment(`list-start-${vnode.id}`)
      const listEndNode = document.createComment('list-end')
      const parentFrag = document.createDocumentFragment()
      parentFrag.appendChild(listStartNode)
      parentFrag.appendChild(listEndNode)
      const effect = new ListEffect(zone, vnode, listStartNode, listEndNode, createTemplateInstance)
      zone.store.useEffect(effect)
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
        const handle = zone.store.useEffect(attributeEffect)
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
        const handle = zone.store.useEffect(propertyEffect)
        stateful.effect = handle
      }

      const events = vnode.data.on
      const elementId = idGenerator.next
      for (const k in events) {
        if (EventsToDelegate.has(k)) {
          element.setAttribute(`data-spheres-${k}`, elementId)
          zone.addEvent("element", elementId, k, events[k])
        } else {
          const handler = events[k]
          element.addEventListener(k, (evt) => {
            zone.store.dispatch(handler(evt))
          })
        }
      }

      for (var i = 0; i < vnode.children.length; i++) {
        vnode.children[i].node = element.appendChild(createNode(zone, idGenerator, vnode.children[i]))
      }

      return element
  }
}

// Template stuff

function createTemplateInstance(zone: Zone, idGenerator: IdentifierGenerator, templateData: TemplateData): Node {
  let template = getDOMTemplate(zone, idGenerator, templateData.template)

  const fragment = template.element.content.cloneNode(true)

  for (const effect of template.effects) {
    effect.attach(zone, fragment.firstChild!, templateData.args)
  }

  const rootElement = fragment.firstChild!
  //@ts-ignore
  rootElement[spheresTemplateData] = { ...templateData }

  return rootElement
}

const templateRegistry = new WeakMap<VirtualTemplate<any>, DOMTemplate>()

function getDOMTemplate(zone: Zone, idGenerator: IdentifierGenerator, virtualTemplate: VirtualTemplate<any>): DOMTemplate {
  let template = templateRegistry.get(virtualTemplate)

  if (template === undefined) {
    const virtualNode = virtualTemplate.virtualNode

    const element = document.createElement("template")
    element.content.appendChild(createTemplateNode(zone, idGenerator, virtualNode))

    template = {
      element,
      effects: findEffectLocations(virtualTemplate, virtualNode, new EffectLocation((root) => root)),
    }

    templateRegistry.set(virtualTemplate, template)
  }

  return template
}

class TextEffectTemplate implements EffectTemplate {
  constructor(private generator: EffectGenerator<string | undefined>, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, props: any) {
    const effect = new UpdateTextEffect(this.location.findNode(root) as Text, this.generator, props)
    zone.store.useEffect(effect)
  }
}

class AttributeEffectTemplate implements EffectTemplate {
  constructor(private generator: EffectGenerator<string | undefined>, private attribute: string, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, props: any) {
    const effect = new UpdateAttributeEffect(this.location.findNode(root) as Element, this.attribute, this.generator, props)
    zone.store.useEffect(effect)
  }
}

class PropertyEffectTemplate implements EffectTemplate {
  constructor(private generator: EffectGenerator<string | undefined>, private property: string, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, props: any) {
    const effect = new UpdatePropertyEffect(this.location.findNode(root) as Element, this.property, this.generator, props)
    zone.store.useEffect(effect)
  }
}

class StatefulZoneEffectTemplate implements EffectTemplate {
  constructor(private generator: EffectGenerator<VirtualNode>, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, props: any) {
    const effect = new StatefulViewEffect(zone, this.location.findNode(root), this.generator, createNode, props)
    zone.store.useEffect(effect)
  }
}

class ListEffectTemplate implements EffectTemplate {
  constructor(private vnode: StatefulListNode, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, _: any) {
    const listStartIndicatorNode = this.location.findNode(root)
    let end = listStartIndicatorNode.nextSibling!

    const effect = new ListEffect(zone, this.vnode, listStartIndicatorNode, end, createTemplateInstance)
    zone.store.useEffect(effect)
  }
}

class EventEffectTemplate implements EffectTemplate {
  constructor(private template: VirtualTemplate<any>, private eventType: string, private handler: StoreEventHandler<any>, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, context: any): void {
    const element = this.location.findNode(root)
    element.addEventListener(this.eventType, (evt) => {
      this.template.setArgs(context)
      zone.store.dispatch(this.handler(evt))
    })
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

    case NodeType.STATEFUL_LIST:
      const markerLocation = location.nextCommentSiblingMatching(`list-start-${vnode.id}`)
      // the only way we can have nested templates right now is via
      // this path. lists inside lists. And here we have the template
      // so we can use the useWithArgs method I think. And we
      // have to pass it into the list effect so that it uses that when it tries
      // to fetch the data for the list.
      // But for any events INSIDE the template instance, right now we store
      // the args but maybe instead we will need to do something like
      // storing a function that calls useWithArgs plus sets the current
      // state for this template instance. It's like the function that sets the
      // args for the template needs to be inside useWithArgs I think?
      // So really need two things ... the function to get the list data needs to
      // be encased in useWithArgs. PLUS we need to wrap a function to set data in
      // useWithArgs so that when events run they get the proper setup. And same
      // with any effect ...
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

      const events = vnode.data.on
      for (const k in events) {
        if (!EventsToDelegate.has(k)) {
          effects.push(new EventEffectTemplate(template, k, events[k], location))
        }
      }

      for (var i = 0; i < vnode.children.length; i++) {
        location = i === 0 ? location.firstChild() : location.nextSibling()
        effects = effects.concat(findEffectLocations(template, vnode.children[i], location))
      }

      return effects
  }
}

function createTemplateNode(zone: Zone, idGenerator: IdentifierGenerator, vnode: VirtualNode): Node {
  switch (vnode.type) {
    case NodeType.TEXT:
      return document.createTextNode(vnode.value)

    case NodeType.STATEFUL_TEXT: {
      return document.createTextNode("")
    }

    case NodeType.STATEFUL: {
      return document.createElement("reactive-zone")
    }

    case NodeType.STATEFUL_LIST:
      // Note this is weird and makes things hard to understand
      // When do we call next? Have we called it everywhere?
      vnode.id = idGenerator.next
      const fragment = document.createDocumentFragment()
      fragment.appendChild(document.createComment(`list-start-${vnode.id}`))
      fragment.appendChild(document.createComment('list-end'))
      return fragment

    default:
      const element = vnode.data.namespace ?
        document.createElementNS(vnode.data.namespace, vnode.tag) :
        document.createElement(vnode.tag)

      const attrs = vnode.data.attrs
      for (const attr in attrs) {
        element.setAttribute(attr, attrs[attr])
      }

      const events = vnode.data.on
      const elementId = idGenerator.next
      for (const k in events) {
        if (EventsToDelegate.has(k)) {
          element.setAttribute(`data-spheres-${k}`, elementId)
          zone.addEvent("template", elementId, k, events[k])
        }
      }

      const props = vnode.data.props
      for (const prop in props) {
        //@ts-ignore
        element[prop] = props[prop]
      }

      for (var i = 0; i < vnode.children.length; i++) {
        vnode.children[i].node = element.appendChild(createTemplateNode(zone, idGenerator, vnode.children[i]))
      }

      return element
  }
}

function activateEffects(zone: Zone, vnode: VirtualNode, node: Node) {
  switch (vnode.type) {
    case NodeType.STATEFUL_TEXT: {
      const effect = new UpdateTextEffect(node as Text, vnode.generator)
      zone.store.useEffect(effect)
      break
    }

    case NodeType.STATEFUL: {
      const effect = new StatefulViewEffect(zone, node, vnode.generator, createNode)
      zone.store.useEffect(effect)
      break
    }

    case NodeType.STATEFUL_LIST: {
      const startNode = node
      vnode.id = startNode.nodeValue!.substring(11)
      let end = node.nextSibling
      while (end && end.nodeValue !== `list-end`) {
        end = end.nextSibling
      }

      const domTemplate = getDOMTemplate(zone, new IdentifierGenerator(vnode.id), vnode.template)

      const effect = new ListEffect(zone, vnode, startNode, end!, createTemplateInstance, (node, templateData) => {
        for (const effect of domTemplate.effects) {
          effect.attach(zone, node, templateData.args)
        }
      })
      zone.store.useEffect(effect)
      break
    }

    case NodeType.ELEMENT:
      const element = node as HTMLElement

      const statefulAttrs = vnode.data.statefulAttrs
      for (const attr in statefulAttrs) {
        const stateful = statefulAttrs[attr]
        const attributeEffect = new UpdateAttributeEffect(element, attr, stateful.generator)
        const handle = zone.store.useEffect(attributeEffect)
        stateful.effect = handle
      }

      const statefulProps = vnode.data.statefulProps
      for (const prop in statefulProps) {
        const stateful = statefulProps[prop]
        const propertyEffect = new UpdatePropertyEffect(element, prop, stateful.generator)
        const handle = zone.store.useEffect(propertyEffect)
        stateful.effect = handle
      }

      const elementEvents = vnode.data.on
      for (const k in elementEvents) {
        if (EventsToDelegate.has(k)) {
          const elementId = element.getAttribute(`data-spheres-${k}`)!
          zone.addEvent("element", elementId, k, elementEvents[k])
        } else {
          const handler = elementEvents[k]
          element.addEventListener(k, (evt) => {
            zone.store.dispatch(handler(evt))
          })
        }
      }

      for (var i = 0; i < vnode.children.length; i++) {
        activateEffects(zone, vnode.children[i], element.childNodes.item(i))
      }
      break
  }
}

