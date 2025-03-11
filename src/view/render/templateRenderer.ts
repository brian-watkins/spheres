import { DOMTemplate, EffectTemplate, EventsToDelegate, Zone } from ".";
import { Stateful, GetState, State } from "../../store";
import { dispatchMessage } from "../../store/message";
import { initListener, TokenRegistry } from "../../store/tokenRegistry";
import { booleanAttributes } from "../elementData";
import { SpecialElementAttributes } from "../specialAttributes";
import { DomTemplateSelector, DomTemplateSelectorBuilder } from "./domRenderer";
import { EffectLocation } from "./effectLocation";
import { UpdateAttributeEffect } from "./effects/attributeEffect";
import { ListEffect } from "./effects/listEffect";
import { SelectViewEffect } from "./effects/selectViewEffect";
import { UpdateTextEffect } from "./effects/textEffect";
import { setEventAttribute } from "./eventHelpers";
import { findListEndNode, findSwitchEndNode, listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers";
import { IdSequence } from "./idSequence";
import { ListItemTemplateContext } from "./templateContext";
import { ConfigurableElement, ElementDefinition, ViewConfig, ViewDefinition, ViewRenderer, ViewSelector } from "./viewRenderer";
import { StoreEventHandler } from "./virtualNode";

export class DomTemplateRenderer implements ViewRenderer {
  public effectTemplates: Array<EffectTemplate> = []
  public isFragment: boolean = false
  public rootType: "element" | "list" | "select" = "element"

  constructor(private zone: Zone, private idSequence: IdSequence, private root: Node, private location: EffectLocation) { }

  textNode(value: string | Stateful<string>): this {
    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    if (typeof value === "function") {
      this.root.appendChild(document.createTextNode(""))
      this.effectTemplates.push(new TextEffectTemplate(value, this.location))
    } else {
      this.root.appendChild(document.createTextNode(value))
    }

    return this
  }

  element(tag: string, builder?: ElementDefinition): this {
    const element = document.createElement(tag)

    const elementId = this.idSequence.next

    // console.log("Root", this.root.nodeType)
    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }
    // const 

    const config = new DomTemplateConfig(this.zone, elementId, element, this.location)

    // Is there a nicer way to do this? We need to add an attribute to the root
    // element of the template (if there is one)
    if (this.root.nodeType === 11) {
      config.recordAttribute("data-spheres-template", "")
    }

    const children = new DomTemplateRenderer(this.zone, this.idSequence, element, this.location)

    builder?.({
      config: config,
      children: children
    })

    this.root.appendChild(element)

    this.effectTemplates = this.effectTemplates.concat(config.effectTemplates, children.effectTemplates)

    return this
  }

  subview(view: ViewDefinition): this {
    throw new Error("method not implemented")
  }

  subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    // here need to set the isFragment flag
    this.isFragment = true
    this.rootType = "list"

    // vnode.id = idSequence.next
    //       const fragment = document.createDocumentFragment()
    //       fragment.appendChild(document.createComment(listStartIndicator(vnode.id)))
    //       fragment.appendChild(document.createComment(listEndIndicator(vnode.id)))
    //       return {
    //         node: fragment,
    //         effects: [new ListEffectTemplate(vnode, location)]
    //       }
    const elementId = this.idSequence.next

    const fragment = document.createDocumentFragment()
    fragment.appendChild(document.createComment(listStartIndicator(elementId)))
    fragment.appendChild(document.createComment(listEndIndicator(elementId)))

    const templateElement = document.createElement("template")

    const renderer = new DomTemplateRenderer(this.zone, new IdSequence(elementId), templateElement.content, new EffectLocation(root => root))
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    const domTemplate: DOMTemplate = {
      isFragment: renderer.isFragment,
      rootType: renderer.rootType,
      element: templateElement,
      effects: renderer.effectTemplates
    }

    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    this.root.appendChild(fragment)

    this.effectTemplates.push(new ListEffectTemplate(domTemplate, data, templateContext, elementId, this.location))

    this.location = this.location.nextCommentSiblingMatching(listEndIndicator(elementId))

    return this
  }

  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this {
    this.isFragment = true
    this.rootType = "select"
    
    // vnode.id = idSequence.next
    const elementId = this.idSequence.next
    const fragment = document.createDocumentFragment()
    fragment.appendChild(document.createComment(switchStartIndicator(elementId)))
    fragment.appendChild(document.createComment(switchEndIndicator(elementId)))
    // return {
    // node: fragment,
    // effects: [new StatefulSelectEffectTemplate(vnode, location)]
    // }

    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    this.root.appendChild(fragment)


    const selectorBuilder = new DomTemplateSelectorBuilder(this.zone, elementId)
    selectorGenerator(selectorBuilder)

    this.effectTemplates.push(new StatefulSelectEffectTemplate(selectorBuilder.selectors, elementId, this.location))

    this.location = this.location.nextCommentSiblingMatching(switchEndIndicator(elementId))

    return this
  }

}

const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <A extends SpecialElementAttributes, B>(element: ConfigurableElement<A, B>) => void) {
      return receiver.element(prop as string, builder)
    }
  }
})

Object.setPrototypeOf(DomTemplateRenderer.prototype, MagicElements)


class DomTemplateConfig implements ViewConfig {
  readonly effectTemplates: Array<EffectTemplate> = []

  constructor(private zone: Zone, private elementId: string, private element: HTMLElement, private location: EffectLocation) { }

  // note that this and innerHTML could be moved to an abstract base class
  // or something
  dataAttribute(name: string, value: string | Stateful<string>): this {
    return this.recordAttribute(`data-${name}`, value)
  }

  innerHTML(html: string | Stateful<string>): this {
    throw new Error("Method not implemented.");
  }

  recordAttribute(name: string, value: string | Stateful<string>): this {
    if (typeof value === "function") {
      this.effectTemplates.push(new AttributeEffectTemplate(value, name, this.location))
    } else {
      this.element.setAttribute(name, value)
    }
    return this
  }

  recordProperty<T extends string | boolean>(name: string, value: T | Stateful<T>): this {
    throw new Error("Method not implemented.");
  }

  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this {
    // const events = vnode.data.on
    // const elementId = idSequence.next
    // for (const k in events) {
    if (EventsToDelegate.has(event)) {
      console.log("Adding delegated event", event, this.elementId)
      setEventAttribute(this.element, event, this.elementId)
      this.zone.addEvent("template", this.elementId, event, handler)
    } else {
      this.effectTemplates.push(new EventEffectTemplate(event, handler, this.location))
    }
    return this
  }

}

const MagicConfig = new Proxy({}, {
  get: (_, prop, receiver) => {
    const attribute = prop as string
    if (booleanAttributes.has(attribute)) {
      return function (isSelected: boolean | Stateful<boolean>) {
        return receiver.recordBooleanAttribute(attribute, isSelected)
      }
    } else {
      return function (value: string | Stateful<string>) {
        return receiver.recordAttribute(attribute, value)
      }
    }
  }
})

Object.setPrototypeOf(DomTemplateConfig.prototype, MagicConfig)

class TextEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private location: EffectLocation) { }

  attach(_: Zone, registry: TokenRegistry, root: Node) {
    const effect = new UpdateTextEffect(registry, this.location.findNode(root) as Text, this.generator)
    initListener(effect)
  }
}

class AttributeEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private attribute: string, private location: EffectLocation) { }

  attach(_: Zone, registry: TokenRegistry, root: Node) {
    const effect = new UpdateAttributeEffect(registry, this.location.findNode(root) as Element, this.attribute, this.generator)
    initListener(effect)
  }
}

class ListEffectTemplate implements EffectTemplate {
  // constructor(private vnode: StatefulListNode, private location: EffectLocation) { }
  constructor(
    private domTemplate: DOMTemplate,
    private query: (get: GetState) => Array<any>,
    private templateContext: ListItemTemplateContext<any>,
    private elementId: string,
    private location: EffectLocation
  ) { }

  attach(zone: Zone, registry: TokenRegistry, root: Node) {
    const listStartIndicatorNode = this.location.findNode(root)
    const end = findListEndNode(listStartIndicatorNode, this.elementId)

    // const effect = new ListEffect(zone, registry, this.vnode, listStartIndicatorNode, end, getDOMTemplate)
    const effect = new ListEffect(zone, registry, this.domTemplate, this.query, this.templateContext, listStartIndicatorNode, end)
    initListener(effect)
  }
}

class StatefulSelectEffectTemplate implements EffectTemplate {
    // constructor(private vnode: StatefulSelectorNode, private location: EffectLocation) { }
    constructor(private selectors: Array<DomTemplateSelector>, private elementId: string, private location: EffectLocation) { }

    attach(zone: Zone, registry: TokenRegistry, root: Node): void {
      const startNode = this.location.findNode(root)
      const endNode = findSwitchEndNode(startNode, this.elementId)

      // const effect = new SelectViewEffect(zone, registry, this.vnode, startNode, endNode, getDOMTemplate)
      const effect = new SelectViewEffect(zone, registry, this.selectors, startNode, endNode)
      initListener(effect)
    }
}

class EventEffectTemplate implements EffectTemplate {
  constructor(private eventType: string, private handler: StoreEventHandler<any>, private location: EffectLocation) { }

  attach(_: Zone, registry: TokenRegistry, root: Node): void {
    const element = this.location.findNode(root)
    element.addEventListener(this.eventType, (evt) => {
      const message = this.handler(evt)
      dispatchMessage(registry, message)
    })
  }
}
