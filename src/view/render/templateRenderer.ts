import { DOMEvent, DOMEventType, EventsToDelegate, StoreEventHandler, Zone } from "./index.js";
import { Stateful, GetState, State } from "../../store/index.js";
import { dispatchMessage } from "../../store/message.js";
import { initListener, TokenRegistry } from "../../store/tokenRegistry.js";
import { EffectLocation } from "./effectLocation.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { ListEffect } from "./effects/listEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { SelectViewEffect } from "./effects/selectViewEffect.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { setEventAttribute } from "./eventHelpers.js";
import { createFragment, findListEndNode, findSwitchEndNode, listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers.js";
import { IdSequence } from "./idSequence.js";
import { ListItemTemplateContext } from "./templateContext.js";
import { AbstractViewConfig, ViewConfigDelegate } from "./viewConfig.js";
import { AbstractViewRenderer, ElementDefinition, isStateful, ViewDefinition, ViewRendererDelegate, ViewSelector } from "./viewRenderer.js";
import { AbstractSelectorBuilder, TemplateSelector } from "./selectorBuilder.js";
import { DOMTemplate, EffectTemplate, TemplateType } from "./domTemplate.js";


export class DomTemplateRenderer extends AbstractViewRenderer {
  public effectTemplates: Array<EffectTemplate> = []
  public templateType: TemplateType = TemplateType.Other
  private templateElement: HTMLTemplateElement | undefined
  private root: Node

  constructor(delegate: ViewRendererDelegate, private zone: Zone, private idSequence: IdSequence, private location: EffectLocation, root?: Node, private eventType: DOMEventType = DOMEventType.Template) {
    super(delegate)
    if (root === undefined) {
      this.templateElement = document.createElement("template")
      this.root = this.templateElement.content
    } else {
      this.root = root
    }
  }

  get template(): DOMTemplate {
    return new DOMTemplate(
      this.templateType,
      this.templateElement!,
      this.effectTemplates
    )
  }

  textNode(value: string | Stateful<string>): this {
    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    if (isStateful(value)) {
      this.root.appendChild(document.createTextNode(""))
      this.effectTemplates.push(new TextEffectTemplate(value, this.location))
    } else {
      this.root.appendChild(document.createTextNode(value))
    }

    return this
  }

  element(tag: string, builder?: ElementDefinition): this {
    const element = this.delegate.createElement(tag)

    const elementId = this.idSequence.next

    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    const config = new DomTemplateConfig(this.delegate.getConfigDelegate(tag), this.zone, elementId, element, this.location, this.eventType)

    if (this.templateElement !== undefined) {
      config.attribute("data-spheres-template", "")
    }

    const children = new DomTemplateRenderer(this.delegate, this.zone, this.idSequence, this.location, element, this.eventType)

    builder?.({
      config: config,
      children: children
    })

    this.root.appendChild(element)

    this.effectTemplates = this.effectTemplates.concat(config.effectTemplates, children.effectTemplates)

    return this
  }

  subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    this.templateType = TemplateType.List

    const elementId = this.idSequence.next
    const fragment = createFragment(listStartIndicator(elementId), listEndIndicator(elementId))

    const renderer = new DomTemplateRenderer(this.delegate, this.zone, new IdSequence(elementId), new EffectLocation(root => root))
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    this.root.appendChild(fragment)

    this.effectTemplates.push(new ListEffectTemplate(renderer.template, data, templateContext, elementId, this.location))

    this.location = this.location.nextCommentSiblingMatching(listEndIndicator(elementId))

    return this
  }

  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this {
    this.templateType = TemplateType.Select

    const elementId = this.idSequence.next
    const fragment = createFragment(switchStartIndicator(elementId), switchEndIndicator(elementId))

    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    this.root.appendChild(fragment)

    const selectorBuilder = new DomTemplateSelectorBuilder(this.delegate, this.zone, elementId)
    selectorGenerator(selectorBuilder)

    this.effectTemplates.push(new StatefulSelectEffectTemplate(selectorBuilder.selectors, elementId, this.location))

    this.location = this.location.nextCommentSiblingMatching(switchEndIndicator(elementId))

    return this
  }
}

class DomTemplateConfig extends AbstractViewConfig {
  readonly effectTemplates: Array<EffectTemplate> = []

  constructor(delegate: ViewConfigDelegate, private zone: Zone, private elementId: string, private element: Element, private location: EffectLocation, private eventType: DOMEvent["type"]) {
    super(delegate)
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (isStateful(value)) {
      this.effectTemplates.push(new AttributeEffectTemplate(value, name, this.location))
    } else {
      this.element.setAttribute(name, value)
    }
    return this
  }

  property<T extends string | boolean>(name: string, value: T | Stateful<T>): this {
    if (isStateful(value)) {
      this.effectTemplates.push(new PropertyEffectTemplate(value, name, this.location))
    } else {
      //@ts-ignore
      this.element[name] = value
    }

    return this
  }

  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this {
    if (EventsToDelegate.has(event)) {
      setEventAttribute(this.element, event, this.elementId)
      this.zone.addEvent(this.eventType, this.elementId, event, handler)
    } else {
      this.effectTemplates.push(new EventEffectTemplate(event, handler, this.location))
    }
    return this
  }
}

class TextEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private location: EffectLocation) { }

  attach(registry: TokenRegistry, root: Node) {
    const effect = new UpdateTextEffect(registry, this.location.findNode(root) as Text, this.generator)
    initListener(effect)
  }
}

class AttributeEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string>, private attribute: string, private location: EffectLocation) { }

  attach(registry: TokenRegistry, root: Node) {
    const effect = new UpdateAttributeEffect(registry, this.location.findNode(root) as Element, this.attribute, this.generator)
    initListener(effect)
  }
}

class PropertyEffectTemplate implements EffectTemplate {
  constructor(private generator: Stateful<string | boolean>, private property: string, private location: EffectLocation) { }

  attach(registry: TokenRegistry, root: Node) {
    const effect = new UpdatePropertyEffect(registry, this.location.findNode(root) as Element, this.property, this.generator)
    initListener(effect)
  }
}

class ListEffectTemplate implements EffectTemplate {
  constructor(
    private domTemplate: DOMTemplate,
    private query: (get: GetState) => Array<any>,
    private templateContext: ListItemTemplateContext<any>,
    private elementId: string,
    private location: EffectLocation
  ) { }

  attach(registry: TokenRegistry, root: Node) {
    const listStartIndicatorNode = this.location.findNode(root)
    const end = findListEndNode(listStartIndicatorNode, this.elementId)

    const effect = new ListEffect(registry, this.domTemplate, this.query, this.templateContext, listStartIndicatorNode, end)
    initListener(effect)
  }
}

class StatefulSelectEffectTemplate implements EffectTemplate {
  constructor(private selectors: Array<TemplateSelector<DOMTemplate>>, private elementId: string, private location: EffectLocation) { }

  attach(registry: TokenRegistry, root: Node): void {
    const startNode = this.location.findNode(root)
    const endNode = findSwitchEndNode(startNode, this.elementId)

    const effect = new SelectViewEffect(registry, this.selectors, startNode, endNode)
    initListener(effect)
  }
}

class EventEffectTemplate implements EffectTemplate {
  constructor(private eventType: string, private handler: StoreEventHandler<any>, private location: EffectLocation) { }

  attach(registry: TokenRegistry, root: Node): void {
    const element = this.location.findNode(root)
    element.addEventListener(this.eventType, (evt) => {
      const message = this.handler(evt)
      dispatchMessage(registry, message)
    })
  }
}

export class DomTemplateSelectorBuilder extends AbstractSelectorBuilder<DOMTemplate> {
  constructor(private delegate: ViewRendererDelegate, private zone: Zone, private elementId: string) {
    super()
  }

  protected createTemplate(view: ViewDefinition, selectorId: number): DOMTemplate {
    const renderer = new DomTemplateRenderer(this.delegate, this.zone, new IdSequence(`${this.elementId}.${selectorId}`), new EffectLocation(root => root))
    view(renderer)

    return renderer.template
  }
}
