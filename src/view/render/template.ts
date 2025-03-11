// import { dispatchMessage } from "../../store/message.js"
// import { initListener, Stateful, TokenRegistry } from "../../store/tokenRegistry.js"
// import { EffectLocation } from "./effectLocation.js"
// import { UpdateAttributeEffect } from "./effects/attributeEffect.js"
// import { ListEffect } from "./effects/listEffect.js"
// import { UpdatePropertyEffect } from "./effects/propertyEffect.js"
// import { SelectViewEffect } from "./effects/selectViewEffect.js"
// import { UpdateTextEffect } from "./effects/textEffect.js"
// import { setEventAttribute } from "./eventHelpers.js"
// import { findListEndNode, findSwitchEndNode, listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers.js"
// import { IdSequence } from "./idSequence.js"
// import { DOMTemplate, EffectTemplate, EventsToDelegate, Zone } from "./index.js"
// import { NodeType, StatefulListNode, StatefulSelectorNode, StoreEventHandler, VirtualNode, VirtualTemplate } from "./virtualNode.js"

// const templateRegistry = new WeakMap<VirtualTemplate, DOMTemplate>()

// export function getDOMTemplate(zone: Zone, idSequence: IdSequence, virtualTemplate: VirtualTemplate): DOMTemplate {
//   let template = templateRegistry.get(virtualTemplate)

//   if (template === undefined) {
//     const virtualNode = virtualTemplate.virtualNode
//     const templateInfo = createTemplateInfo(zone, idSequence, virtualNode, new EffectLocation(root => root))

//     const element = document.createElement("template")
//     element.content.appendChild(templateInfo.node)

//     template = {
//       isFragment: virtualNode.type === NodeType.STATEFUL_LIST || virtualNode.type === NodeType.STATEFUL_SELECTOR,
//       element,
//       effects: templateInfo.effects
//     }

//     templateRegistry.set(virtualTemplate, template)
//   }

//   return template
// }

// class TextEffectTemplate implements EffectTemplate {
//   constructor(private generator: Stateful<string>, private location: EffectLocation) { }

//   attach(_: Zone, registry: TokenRegistry, root: Node) {
//     const effect = new UpdateTextEffect(registry, this.location.findNode(root) as Text, this.generator)
//     initListener(effect)
//   }
// }

// class AttributeEffectTemplate implements EffectTemplate {
//   constructor(private generator: Stateful<string>, private attribute: string, private location: EffectLocation) { }

//   attach(_: Zone, registry: TokenRegistry, root: Node) {
//     const effect = new UpdateAttributeEffect(registry, this.location.findNode(root) as Element, this.attribute, this.generator)
//     initListener(effect)
//   }
// }

// class PropertyEffectTemplate implements EffectTemplate {
//   constructor(private generator: Stateful<string>, private property: string, private location: EffectLocation) { }

//   attach(_: Zone, registry: TokenRegistry, root: Node) {
//     const effect = new UpdatePropertyEffect(registry, this.location.findNode(root) as Element, this.property, this.generator)
//     initListener(effect)
//   }
// }

// class StatefulSelectEffectTemplate implements EffectTemplate {
//     constructor(private vnode: StatefulSelectorNode, private location: EffectLocation) { }

//     attach(zone: Zone, registry: TokenRegistry, root: Node): void {
//       const startNode = this.location.findNode(root)
//       const endNode = findSwitchEndNode(startNode, this.vnode.id!)

//       const effect = new SelectViewEffect(zone, registry, this.vnode, startNode, endNode, getDOMTemplate)
//       initListener(effect)
//     }
// }

// class ListEffectTemplate implements EffectTemplate {
//   constructor(private vnode: StatefulListNode, private location: EffectLocation) { }

//   attach(zone: Zone, registry: TokenRegistry, root: Node) {
//     const listStartIndicatorNode = this.location.findNode(root)
//     const end = findListEndNode(listStartIndicatorNode, this.vnode.id!)

//     const effect = new ListEffect(zone, registry, this.vnode, listStartIndicatorNode, end, getDOMTemplate)
//     initListener(effect)
//   }
// }

// class EventEffectTemplate implements EffectTemplate {
//   constructor(private eventType: string, private handler: StoreEventHandler<any>, private location: EffectLocation) { }

//   attach(_: Zone, registry: TokenRegistry, root: Node): void {
//     const element = this.location.findNode(root)
//     element.addEventListener(this.eventType, (evt) => {
//       const message = this.handler(evt)
//       dispatchMessage(registry, message)
//     })
//   }
// }

// interface TemplateInfo {
//   node: Node
//   effects: Array<EffectTemplate>
// }

// function createTemplateInfo(zone: Zone, idSequence: IdSequence, vnode: VirtualNode, location: EffectLocation): TemplateInfo {
//   switch (vnode.type) {
//     case NodeType.TEXT:
//       return {
//         node: document.createTextNode(vnode.value),
//         effects: []
//       }

//     case NodeType.STATEFUL_TEXT: {
//       return {
//         node: document.createTextNode(""),
//         effects: [new TextEffectTemplate(vnode.generator, location)]
//       }
//     }

//     case NodeType.STATEFUL_SELECTOR: {
//       vnode.id = idSequence.next
//       const fragment = document.createDocumentFragment()
//       fragment.appendChild(document.createComment(switchStartIndicator(vnode.id)))
//       fragment.appendChild(document.createComment(switchEndIndicator(vnode.id)))
//       return {
//         node: fragment,
//         effects: [new StatefulSelectEffectTemplate(vnode, location)]
//       }
//     }

//     case NodeType.STATEFUL_LIST:
//       vnode.id = idSequence.next
//       const fragment = document.createDocumentFragment()
//       fragment.appendChild(document.createComment(listStartIndicator(vnode.id)))
//       fragment.appendChild(document.createComment(listEndIndicator(vnode.id)))
//       return {
//         node: fragment,
//         effects: [new ListEffectTemplate(vnode, location)]
//       }

//     default:
//       let effects: Array<EffectTemplate> = []

//       const element = vnode.data.namespace ?
//         document.createElementNS(vnode.data.namespace, vnode.tag) :
//         document.createElement(vnode.tag)

//       const attrs = vnode.data.attrs
//       for (const attr in attrs) {
//         element.setAttribute(attr, attrs[attr])
//       }

//       const statefulAttrs = vnode.data.statefulAttrs
//       for (const attr in statefulAttrs) {
//         effects.push(new AttributeEffectTemplate(statefulAttrs[attr], attr, location))
//       }

//       const props = vnode.data.props
//       for (const prop in props) {
//         //@ts-ignore
//         element[prop] = props[prop]
//       }

//       const statefulProps = vnode.data.statefulProps
//       for (const prop in statefulProps) {
//         effects.push(new PropertyEffectTemplate(statefulProps[prop], prop, location))
//       }

//       const events = vnode.data.on
//       const elementId = idSequence.next
//       for (const k in events) {
//         if (EventsToDelegate.has(k)) {
//           setEventAttribute(element, k, elementId)
//           zone.addEvent("template", elementId, k, events[k])
//         } else {
//           effects.push(new EventEffectTemplate(k, events[k], location))
//         }
//       }

//       let lastChild: VirtualNode | undefined
//       for (var i = 0; i < vnode.children.length; i++) {
//         if (i === 0) {
//           location = location.firstChild()
//         } else if (lastChild && lastChild.type === NodeType.STATEFUL_SELECTOR) {
//           location = location.nextCommentSiblingMatching(switchEndIndicator(lastChild.id!)).nextSibling()
//         } else if (lastChild && lastChild.type === NodeType.STATEFUL_LIST) {
//           location = location.nextCommentSiblingMatching(listEndIndicator(lastChild.id!)).nextSibling()
//         } else {
//           location = location.nextSibling()
//         }

//         const childTemplateInfo = createTemplateInfo(zone, idSequence, vnode.children[i], location)
//         element.appendChild(childTemplateInfo.node)
//         effects = effects.concat(childTemplateInfo.effects)

//         lastChild = vnode.children[i]
//       }

//       return {
//         node: element,
//         effects: effects
//       }
//   }
// }
