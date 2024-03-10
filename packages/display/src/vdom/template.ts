import { GetState, Store, StoreMessage } from "@spheres/store"
import { NodeType, Stateful, TemplateNode, VirtualNode, VirtualTemplate } from "./virtualNode.js"
import { UpdateAttributeEffect } from "./effects/attributeEffect.js"
import { UpdatePropertyEffect } from "./effects/propertyEffect.js"
import { UpdateTextEffect } from "./effects/textEffect.js"
import { NodeReference, PatchZoneEffect } from "./effects/zoneEffect.js"

const templateRegistry = new WeakMap<VirtualTemplate<any>, DOMTemplate>()

interface DOMTemplate {
  element: HTMLTemplateElement
  effects: Array<EffectTemplate>
}

export function createTemplateInstance(store: Store, vnode: TemplateNode): Node {
  let template = getTemplate(vnode)

  const root = template.element.content.cloneNode(true)

  for (const effect of vnode.effects) {
    effect.attach(store, root)
  }

  return root.firstChild!
}

function getTemplate(vnode: TemplateNode): DOMTemplate {
  let template = templateRegistry.get(vnode.template)

  if (template === undefined) {
    const virtualNode = vnode.template.virtualNode

    const element = document.createElement("template")
    element.content.appendChild(createTemplateNode(virtualNode))

    template = {
      element,
      effects: findEffectLocations(vnode.template, virtualNode, new EffectLocation((root) => root.firstChild!))
    }

    templateRegistry.set(vnode.template, template)
  }

  return template
}

export class EffectLocation {
  constructor(readonly findNode: (root: Node) => Node) { }

  nextSibling(): EffectLocation {
    return new EffectLocation((root) => this.findNode(root).nextSibling!)
  }

  firstChild(): EffectLocation {
    return new EffectLocation((root) => this.findNode(root).firstChild!)
  }
}

export interface EffectTemplate {
  attach(store: Store, root: Node): void
}

class TextEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private findNode: (root: Node) => Node) { }

  attach(store: Store, root: Node) {
    const effect = new UpdateTextEffect(this.findNode(root) as Text, this.generator)
    store.useEffect(effect)
  }
}

class AttributeEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private attribute: string, private findNode: (root: Node) => Node) { }

  attach(store: Store, root: Node) {
    const effect = new UpdateAttributeEffect(this.findNode(root) as Element, this.attribute, this.generator)
    store.useEffect(effect)
  }
}

class PropertyEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private property: string, private findNode: (root: Node) => Node) { }

  attach(store: Store, root: Node) {
    const effect = new UpdatePropertyEffect(this.findNode(root) as Element, this.property, this.generator)
    store.useEffect(effect)
  }
}

class EventEffectTemplate implements EffectTemplate {
  constructor(private event: string, private handler: (evt: Event) => StoreMessage<any>, private findNode: (root: Node) => Node) { }

  attach(store: Store, root: Node) {
    const element = this.findNode(root) as Element
    element.addEventListener(this.event, (evt) => {
      store.dispatch(this.handler(evt))
    })
  }
}

class StatefulZoneEffectTemplate implements EffectTemplate {
  constructor(private generator: (get: GetState) => VirtualNode, private nodeReference: NodeReference, private findNode: (root: Node) => Node) { }

  attach(store: Store, root: Node): void {
    const effect = new PatchZoneEffect(store, this.findNode(root), this.generator, this.nodeReference)
    store.useEffect(effect)
  }
}

class TemplateTemplate implements EffectTemplate {
  constructor(private vnode: TemplateNode, private findNode: (root: Node) => Node) { }

  attach(store: Store, root: Node): void {
    const placeholder = this.findNode(root)
    const templateNode = createTemplateInstance(store, this.vnode)
    placeholder.parentNode?.replaceChild(templateNode, placeholder)
  }
}

export function findEffectLocations(template: VirtualTemplate<any>, vnode: VirtualNode, location: EffectLocation): Array<EffectTemplate> {
  switch (vnode.type) {
    case NodeType.TEXT:
      return []

    case NodeType.STATEFUL_TEXT:
      return [new TextEffectTemplate(vnode.generator, location.findNode)]

    case NodeType.STATEFUL:
      return [new StatefulZoneEffectTemplate(vnode.generator, vnode, location.findNode)]

    case NodeType.BLOCK:
      return findEffectLocations(template, vnode.generator!(), location)

    case NodeType.TEMPLATE:
      return [new TemplateTemplate(vnode, location.findNode)]

    case NodeType.ELEMENT:
      let effects: Array<EffectTemplate> = []

      const statefulAttrs = vnode.data.statefulAttrs
      for (const attr in statefulAttrs) {
        effects.push(new AttributeEffectTemplate(statefulAttrs[attr].generator, attr, location.findNode))
      }

      const statefulProps = vnode.data.statefulProps
      for (const prop in statefulProps) {
        effects.push(new PropertyEffectTemplate(statefulProps[prop].generator, prop, location.findNode))
      }

      const events = vnode.data.on
      for (const k in events) {
        effects.push(new EventEffectTemplate(k, events[k].handler, location.findNode))
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

    case NodeType.BLOCK:
      return createTemplateNode(vnode.generator!())

    case NodeType.TEMPLATE:
      return document.createElement("nested-template")

    default:
      const element = vnode.data.namespace ?
        document.createElementNS(vnode.data.namespace, vnode.tag) :
        document.createElement(vnode.tag)

      const attrs = vnode.data.attrs
      for (const attr in attrs) {
        element.setAttribute(attr, attrs[attr])
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
