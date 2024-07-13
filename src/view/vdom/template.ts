import { Store, StoreMessage } from "../../store/index.js"
import { NodeType, TemplateListNode, TemplateNode, VirtualNode, VirtualTemplate } from "./virtualNode.js"
import { UpdateAttributeEffect } from "./effects/attributeEffect.js"
import { UpdatePropertyEffect } from "./effects/propertyEffect.js"
import { UpdateTextEffect } from "./effects/textEffect.js"
import { NodeReference, PatchZoneEffect } from "./effects/zoneEffect.js"
import { EffectGenerator } from "./effects/effectGenerator.js"
import { ListEffect } from "./effects/listEffect.js"
import { EffectLocation } from "./effectLocation.js"

const templateRegistry = new WeakMap<VirtualTemplate<any>, DOMTemplate>()

// Move these to virtual node and replace the `on` param with an EventMap
// Do we even need the EventHandler object anymore?
type StoreEventHandler<T> = (evt: Event) => StoreMessage<T>
type EventMap = Map<string, StoreEventHandler<any>>

interface DOMTemplate {
  element: HTMLTemplateElement
  effects: Array<EffectTemplate>
  events: Map<string, EventMap>
}

export function createTemplateInstance(store: Store, vnode: TemplateNode): Node {
  let template = getTemplate(vnode)

  const root = template.element.content.cloneNode(true)

  for (const effect of template.effects) {
    effect.attach(store, root, vnode.args)
  }

  const rootElement = root.firstChild!
  attachEvents(template, vnode, store, rootElement)

  return rootElement
}

function attachEvents(template: DOMTemplate, vnode: TemplateNode, store: Store, rootElement: Node) {
  for (const eventType of template.events.keys()) {
    const args = vnode.args
    const virtualTemplate = vnode.template
    const eventMap = template.events.get(eventType)!
    rootElement.addEventListener(eventType, (evt) => {
      //@ts-ignore
      const node = evt.target!.closest(`[data-spheres-${eventType}]`) as Element
      if (node) {
        const handler = eventMap.get(node.getAttribute(`data-spheres-${eventType}`)!)!
        virtualTemplate.setArgs(args)
        store.dispatch(handler(evt))
        evt.stopPropagation()
      }
    })
  }
}

function getTemplate(vnode: TemplateNode): DOMTemplate {
  let template = templateRegistry.get(vnode.template)

  if (template === undefined) {
    const virtualNode = vnode.template.virtualNode

    const element = document.createElement("template")
    element.content.appendChild(createTemplateNode(virtualNode))

    const eventMap = new Map<string, EventMap>()
    findEvents(eventMap, virtualNode)

    template = {
      element,
      effects: findEffectLocations(vnode.template, virtualNode, new EffectLocation((root) => root.firstChild!)),
      events: eventMap
    }

    templateRegistry.set(vnode.template, template)
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
  constructor(private generator: EffectGenerator<VirtualNode>, private nodeReference: NodeReference, private location: EffectLocation) { }

  attach(store: Store, root: Node, props: any) {
    const effect = new PatchZoneEffect(store, this.location.findNode(root), this.generator, this.nodeReference, props)
    store.useEffect(effect)
  }
}

class TemplateTemplate implements EffectTemplate {
  constructor(private vnode: TemplateNode, private location: EffectLocation) { }

  attach(store: Store, root: Node, _: any) {
    const placeholder = this.location.findNode(root)
    const templateNode = createTemplateInstance(store, this.vnode)
    placeholder.parentNode?.replaceChild(templateNode, placeholder)
  }
}

class ListEffectTemplate implements EffectTemplate {
  constructor(private vnode: TemplateListNode, private location: EffectLocation) { }

  attach(store: Store, root: Node, _: any) {
    const listStartIndicatorNode = this.location.findNode(root)
    const effect = new ListEffect(store, this.vnode, listStartIndicatorNode, createTemplateInstance)
    store.useEffect(effect)
  }
}

function findEvents(events: Map<string, EventMap>, vnode: VirtualNode) {
  switch (vnode.type) {
    case NodeType.ELEMENT:
      // We could make the `on` object a EventMap, right?
      const elementEvents = vnode.data.on
      for (const k in elementEvents) {
        let map = events.get(k)
        if (map === undefined) {
          map = new Map<string, StoreEventHandler<any>>()
          events.set(k, map)
        }
        map.set(vnode.data.eventId!, elementEvents[k].handler)
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
      return [new StatefulZoneEffectTemplate(template.useWithArgs(vnode.generator), vnode, location)]

    case NodeType.BLOCK:
      return findEffectLocations(template, vnode.generator!(), location)

    case NodeType.TEMPLATE:
      return [new TemplateTemplate(vnode, location)]

    case NodeType.TEMPLATE_LIST:
      const markerLocation = location.nextCommentSiblingMatching(`template-list-${vnode.id}`)
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

export function createTemplateNode(vnode: VirtualNode): Node {
  switch (vnode.type) {
    case NodeType.TEXT:
      return document.createTextNode(vnode.value)

    case NodeType.STATEFUL_TEXT: {
      return document.createTextNode("")
    }

    case NodeType.STATEFUL: {
      return document.createElement("reactive-zone")
    }

    case NodeType.BLOCK:
      return createTemplateNode(vnode.generator!())

    case NodeType.TEMPLATE:
      return document.createElement("nested-template")

    case NodeType.TEMPLATE_LIST:
      return document.createComment(`template-list-${vnode.id}`)

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
