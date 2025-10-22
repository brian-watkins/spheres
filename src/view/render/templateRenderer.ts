import { DOMEvent, DOMEventType, EventsToDelegate, StoreEventHandler, EventZone } from "./index.js";
import { Stateful, GetState, State, Entity } from "../../store/index.js";
import { EffectLocation } from "./effectLocation.js";
import { setEventAttribute } from "./eventHelpers.js";
import { createFragment, listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers.js";
import { IdSequence } from "./idSequence.js";
import { ListEntityTemplateContext, ListItemTemplateContext } from "./templateContext.js";
import { AbstractViewConfig } from "./viewConfig.js";
import { AbstractViewRenderer, ElementDefinition, isStateful, ViewDefinition, ViewSelector } from "./viewRenderer.js";
import { DOMTemplate, EffectTemplate, EffectTemplateTypes, TemplateType } from "./domTemplate.js";
import { SelectorBuilder } from "./selectorBuilder.js";
import { ElementConfigSupport, ElementSupport } from "../elementSupport.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { EntityRef } from "../../store/state/entity.js";

export class DomTemplateRenderer extends AbstractViewRenderer {
  public effectTemplates: Array<EffectTemplate> = []
  public templateType: TemplateType = TemplateType.Other
  private templateElement: HTMLTemplateElement | undefined
  private root: Node

  constructor(private elementSupport: ElementSupport, private zone: EventZone, private idSequence: IdSequence, private location: EffectLocation, root?: Node, private eventType: DOMEventType = DOMEventType.Template) {
    super()
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
        effect: new UpdateTextEffect(this.location, value)
      })
    } else {
      this.root.appendChild(document.createTextNode(value))
    }

    return this
  }

  element(tag: string, builder?: ElementDefinition, support?: ElementSupport): this {
    const renderSupport = support ?? this.elementSupport

    const element = renderSupport.createElement(tag)

    const elementId = this.idSequence.next

    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    const config = new DomTemplateConfig(renderSupport.getConfigSupport(tag), this.zone, elementId, element, this.location, this.eventType)

    if (this.templateElement !== undefined) {
      config.attribute("data-spheres-template", "")
    }

    const children = new DomTemplateRenderer(renderSupport, this.zone, this.idSequence, this.location, element, this.eventType)

    builder?.({
      config: config,
      children: children
    })

    this.root.appendChild(element)

    this.effectTemplates = this.effectTemplates.concat(config.effectTemplates, children.effectTemplates)

    return this
  }

  entityViews<T>(data: (get: GetState) => Entity<Array<T>>, viewGenerator: (item: EntityRef<T>, index?: State<number>) => ViewDefinition): this {
    this.templateType = TemplateType.List

    const elementId = this.idSequence.next
    const fragment = createFragment(listStartIndicator(elementId), listEndIndicator(elementId))

    // this determines how the template is generated
    const renderer = new DomTemplateRenderer(this.elementSupport, this.zone, new IdSequence(elementId), new EffectLocation(root => root))
    
    // this calls the renderer and provides some tokens thast will be captured
    // by the effects. It also records any tokens created inside the
    // view function
    const templateContext = new ListEntityTemplateContext(renderer, viewGenerator)
  
    if (this.root.nodeType === 1) {
      this.location = this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    }

    this.root.appendChild(fragment)

    this.effectTemplates.push({
      type: EffectTemplateTypes.ListEntity,
      domTemplate: renderer.template,
      query: data,
      context: templateContext,
      elementId,
      location: this.location
    })

    this.location = this.location.nextCommentSiblingMatching(listEndIndicator(elementId))

    return this
  }

  subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    this.templateType = TemplateType.List

    const elementId = this.idSequence.next
    const fragment = createFragment(listStartIndicator(elementId), listEndIndicator(elementId))

    const renderer = new DomTemplateRenderer(this.elementSupport, this.zone, new IdSequence(elementId), new EffectLocation(root => root))
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

    const selectorBuilder = new SelectorBuilder(createDOMTemplate(this.elementSupport, this.zone, elementId))
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

  constructor(support: ElementConfigSupport, private zone: EventZone, private elementId: string, private element: Element, private location: EffectLocation, private eventType: DOMEvent["type"]) {
    super(support)
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (isStateful(value)) {
      this.effectTemplates.push({
        type: EffectTemplateTypes.Attribute,
        effect: new UpdateAttributeEffect(this.location, name, value)
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
        effect: new UpdatePropertyEffect(this.location, name, value)
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

export function createDOMTemplate(elementSupport: ElementSupport, zone: EventZone, elementId: string): (view: ViewDefinition, selectorId: number) => DOMTemplate {
  return (view, selectorId) => {
    const renderer = new DomTemplateRenderer(elementSupport, zone, new IdSequence(`${elementId}.${selectorId}`), new EffectLocation(root => root))
    view(renderer)
    return renderer.template
  }
}
