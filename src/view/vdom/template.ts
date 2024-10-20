import { EffectLocation } from "./effectLocation"
import { UpdateAttributeEffect } from "./effects/attributeEffect"
import { ListEffect } from "./effects/listEffect"
import { UpdatePropertyEffect } from "./effects/propertyEffect"
import { SwitchViewEffect } from "./effects/switchViewEffect"
import { UpdateTextEffect } from "./effects/textEffect"
import { IdentifierGenerator } from "./idGenerator"
import { ArgsController, DOMTemplate, EffectTemplate, EventsToDelegate, NodeReference, Zone } from "./render"
import { NodeType, Stateful, StatefulListNode, StatefulSwitchNode, StoreEventHandler, VirtualNode, VirtualTemplate } from "./virtualNode"

const templateRegistry = new WeakMap<VirtualTemplate<any>, DOMTemplate>()

export function getDOMTemplate(zone: Zone, idGenerator: IdentifierGenerator, virtualTemplate: VirtualTemplate<any>): DOMTemplate {
  let template = templateRegistry.get(virtualTemplate)

  if (template === undefined) {
    const virtualNode = virtualTemplate.virtualNode

    const element = document.createElement("template")
    element.content.appendChild(createTemplateNode(zone, idGenerator, virtualNode))

    template = {
      element,
      effects: findEffectLocations(virtualNode, new EffectLocation((root) => root)),
    }

    templateRegistry.set(virtualTemplate, template)
  }

  return template
}

class TextEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, argsController: ArgsController, args: any) {
    const effect = new UpdateTextEffect(this.location.findNode(root) as Text, this.generator, argsController, args)
    zone.store.useEffect(effect)
  }
}

class AttributeEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private attribute: string, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, argsController: ArgsController, args: any) {
    const effect = new UpdateAttributeEffect(this.location.findNode(root) as Element, this.attribute, this.generator, argsController, args)
    zone.store.useEffect(effect)
  }
}

class PropertyEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private property: string, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, argsConroller: ArgsController, args: any) {
    // Need to write a test with nested ArgsController!
    const effect = new UpdatePropertyEffect(this.location.findNode(root) as Element, this.property, this.generator, argsConroller, args)
    zone.store.useEffect(effect)
  }
}

class StatefulSwitchEffectTemplate implements EffectTemplate {
  constructor(private vnode: StatefulSwitchNode, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, argsController: ArgsController, args: any, nodeReference: NodeReference): void {
    nodeReference!.node = this.location.findNode(root)
    // NOTE: Not done yet!
    const effect = new SwitchViewEffect(zone, this.vnode, "not done yet", argsController, args, nodeReference, getDOMTemplate)
    zone.store.useEffect(effect)
  }
}

class ListEffectTemplate implements EffectTemplate {
  constructor(private vnode: StatefulListNode, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, argsController: ArgsController, args: any) {
    const listStartIndicatorNode = this.location.findNode(root)
    let end = listStartIndicatorNode.nextSibling!

    const template = this.vnode.template

    const nextArgsController: ArgsController = {
      setArgs(nextArgs) {
        argsController.setArgs(args)
        template.setArgs(nextArgs)
      },
    }

    const effect = new ListEffect(zone, this.vnode, nextArgsController, listStartIndicatorNode, end, getDOMTemplate)
    zone.store.useEffect(effect)
  }
}

class EventEffectTemplate implements EffectTemplate {
  constructor(private eventType: string, private handler: StoreEventHandler<any>, private location: EffectLocation) { }

  attach(zone: Zone, root: Node, argsConroller: ArgsController, args: any): void {
    const element = this.location.findNode(root)
    element.addEventListener(this.eventType, (evt) => {
      argsConroller.setArgs(args)
      const message = this.handler(evt)
      zone.store.dispatch(message)
    })
  }
}

function findEffectLocations(vnode: VirtualNode, location: EffectLocation): Array<EffectTemplate> {
  switch (vnode.type) {
    case NodeType.TEXT:
      return []

    case NodeType.STATEFUL_TEXT:
      return [new TextEffectTemplate(vnode.generator, location)]

    case NodeType.STATEFUL_SWITCH:
      return [new StatefulSwitchEffectTemplate(vnode, location)]

    case NodeType.STATEFUL_LIST:
      const markerLocation = location.nextCommentSiblingMatching(`list-start-${vnode.id}`)
      return [new ListEffectTemplate(vnode, markerLocation)]

    case NodeType.ELEMENT:
      let effects: Array<EffectTemplate> = []

      const statefulAttrs = vnode.data.statefulAttrs
      for (const attr in statefulAttrs) {
        effects.push(new AttributeEffectTemplate(statefulAttrs[attr].generator, attr, location))
      }

      const statefulProps = vnode.data.statefulProps
      for (const prop in statefulProps) {
        effects.push(new PropertyEffectTemplate(statefulProps[prop].generator, prop, location))
      }

      const events = vnode.data.on
      for (const k in events) {
        if (!EventsToDelegate.has(k)) {
          effects.push(new EventEffectTemplate(k, events[k], location))
        }
      }

      for (var i = 0; i < vnode.children.length; i++) {
        location = i === 0 ? location.firstChild() : location.nextSibling()
        effects = effects.concat(findEffectLocations(vnode.children[i], location))
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

    case NodeType.STATEFUL_SWITCH: {
      return document.createElement("stateful-view")
    }

    case NodeType.STATEFUL_LIST:
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
