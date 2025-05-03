import { DOMEvent, DOMEventType, EventsToDelegate, StoreEventHandler, Zone } from "./index.js";
import { Stateful, GetState, State } from "../../store/index.js";
import { EffectLocation } from "./effectLocation.js";
import { setEventAttribute } from "./eventHelpers.js";
import { createFragment, listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers.js";
import { IdSequence } from "./idSequence.js";
import { ListItemTemplateContext } from "./templateContext.js";
import { AbstractViewConfig, ViewConfigDelegate } from "./viewConfig.js";
import { AbstractViewRenderer, ElementDefinition, isStateful, ViewDefinition, ViewRendererDelegate, ViewSelector } from "./viewRenderer.js";
import { DOMTemplate, EffectTemplate, EffectTemplateTypes, TemplateType } from "./domTemplate.js";
import { SelectorBuilder } from "./selectorBuilder.js";


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
    return {
      type: this.templateType,
      element: this.templateElement!,
      effects: this.effectTemplates,
      isFragment: this.templateType === TemplateType.List || this.templateType === TemplateType.Select
    }
  }

  textNode(value: string | Stateful<string>): this {
    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    if (isStateful(value)) {
      this.root.appendChild(document.createTextNode(""))
      this.effectTemplates.push({
        type: EffectTemplateTypes.Text,
        generator: value,
        location: this.location
      })
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

    this.effectTemplates.push({
      type: EffectTemplateTypes.List,
      domTemplate: renderer.template,
      query: data,
      context: templateContext,
      elementId,
      location: this.location
    })

    this.location = this.location.nextCommentSiblingMatching(listEndIndicator(elementId))

    return this
  }

  subviewFrom(selectorGenerator: (selector: ViewSelector) => void): this {
    this.templateType = TemplateType.Select

    const elementId = this.idSequence.next
    const fragment = createFragment(switchStartIndicator(elementId), switchEndIndicator(elementId))

    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    this.root.appendChild(fragment)

    const selectorBuilder = new SelectorBuilder(createDOMTemplate(this.delegate, this.zone, elementId))
    selectorGenerator(selectorBuilder)

    this.effectTemplates.push({
      type: EffectTemplateTypes.Select,
      selectors: selectorBuilder.selectors,
      elementId,
      location: this.location
    })

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
      this.effectTemplates.push({
        type: EffectTemplateTypes.Attribute,
        name,
        generator: value,
        location: this.location
      })
    } else {
      this.element.setAttribute(name, value)
    }
    return this
  }

  property<T extends string | boolean>(name: string, value: T | Stateful<T>): this {
    if (isStateful(value)) {
      this.effectTemplates.push({
        type: EffectTemplateTypes.Property,
        name,
        generator: value,
        location: this.location
      })
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
      this.effectTemplates.push({
        type: EffectTemplateTypes.Event,
        name: event,
        handler,
        location: this.location
      })
    }
    return this
  }
}

export function createDOMTemplate(delegate: ViewRendererDelegate, zone: Zone, elementId: string): (view: ViewDefinition, selectorId: number) => DOMTemplate {
  return (view, selectorId) => {
    const renderer = new DomTemplateRenderer(delegate, zone, new IdSequence(`${elementId}.${selectorId}`), new EffectLocation(root => root))
    view(renderer)
    return renderer.template
  }
}
