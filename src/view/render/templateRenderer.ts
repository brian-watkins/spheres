import { DOMEvent, DOMEventType, EventsToDelegate, StoreEventHandler, EventZone } from "./index.js";
import { Stateful, GetState } from "../../store/index.js";
import { EffectLocation } from "./effectLocation.js";
import { setEventAttribute } from "./eventHelpers.js";
import { createFragment, listEndIndicator, listStartIndicator, matchEndIndicator, matchStartIndicator } from "./fragmentHelpers.js";
import { IdSequence } from "./idSequence.js";
import { ListItemTemplateContext } from "./templateContext.js";
import { AbstractViewConfig } from "./viewConfig.js";
import { AbstractViewRenderer, ElementDefinition, UseItem, ViewDefinition, ViewMatcher } from "./viewRenderer.js";
import { DOMTemplate, EffectTemplate, EffectTemplateTypes, TemplateType } from "./domTemplate.js";
import { MatcherBuilder } from "./viewMatcherBuilder.js";
import { ElementConfigSupport, ElementSupport } from "../elementSupport.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { isStateful } from "../../store/tokenRegistry.js";
import { ElementIdentifier } from "../element.js";

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
      isFragment: this.templateType === TemplateType.List ||
        this.templateType === TemplateType.Match ||
        this.root.childNodes.length > 1
    }
  }

  private advanceLocation(): EffectLocation {
    if (this.root.nodeType === 1) {
      return this.root.hasChildNodes() ? this.location.nextSibling() : this.location.firstChild()
    } else if (this.root.nodeType === 11) {
      return this.root.hasChildNodes() ? this.location.nextSibling() : this.location
    } else {
      return this.location
    }
  }

  textNode(value: string | Stateful<string>): this {
    this.location = this.advanceLocation()

    if (isStateful(value)) {
      this.root.appendChild(document.createTextNode(""))
      this.effectTemplates.push({
        type: EffectTemplateTypes.Text,
        effect: new UpdateTextEffect(value),
        location: this.location
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

    this.location = this.advanceLocation()

    const config = new DomTemplateConfig(renderSupport.getConfigSupport(tag), this.zone, elementId, element, this.location, this.eventType)

    const children = new DomTemplateRenderer(renderSupport, this.zone, this.idSequence, this.location, element, this.eventType)

    builder?.({
      config: config,
      children: children
    })

    this.root.appendChild(element)

    this.effectTemplates = this.effectTemplates.concat(config.effectTemplates, children.effectTemplates)

    return this
  }

  subviews<T>(
    data: (get: GetState) => Array<T>,
    viewGenerator: (useItem: UseItem<T>) => ViewDefinition
  ): this {
    this.templateType = TemplateType.List

    const elementId = this.idSequence.next
    const fragment = createFragment(listStartIndicator(elementId), listEndIndicator(elementId))

    const renderer = new DomTemplateRenderer(this.elementSupport, this.zone, new IdSequence(elementId), new EffectLocation(root => root))
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    this.location = this.advanceLocation()

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

  subviewMatching(matcherGenerator: (matcher: ViewMatcher) => void): this {
    this.templateType = TemplateType.Match

    const elementId = this.idSequence.next
    const fragment = createFragment(matchStartIndicator(elementId), matchEndIndicator(elementId))

    this.location = this.advanceLocation()

    this.root.appendChild(fragment)

    const matcherBuilder = new MatcherBuilder(createDOMTemplate(this.elementSupport, this.zone, elementId))
    matcherGenerator(matcherBuilder)

    this.effectTemplates.push({
      type: EffectTemplateTypes.Match,
      collection: matcherBuilder.collection,
      elementId,
      location: this.location
    })

    this.location = this.location.nextCommentSiblingMatching(matchEndIndicator(elementId))

    return this
  }
}

class DomTemplateConfig extends AbstractViewConfig {
  readonly effectTemplates: Array<EffectTemplate> = []

  constructor(support: ElementConfigSupport, private zone: EventZone, private elementId: string, private element: Element, private location: EffectLocation, private eventType: DOMEvent["type"]) {
    super(support)
  }

  elementIdentifier(id: ElementIdentifier<any>): this {
    this.effectTemplates.push({
      type: EffectTemplateTypes.Element,
      identifier: id,
      location: this.location
    })

    return this
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (isStateful(value)) {
      this.effectTemplates.push({
        type: EffectTemplateTypes.Attribute,
        effect: new UpdateAttributeEffect(name, value),
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
        effect: new UpdatePropertyEffect(name, value),
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

export function createDOMTemplate(elementSupport: ElementSupport, zone: EventZone, elementId: string): (view: ViewDefinition, selectorId: number) => DOMTemplate {
  return (view, selectorId) => {
    const renderer = new DomTemplateRenderer(elementSupport, zone, new IdSequence(`${elementId}.${selectorId}`), new EffectLocation(root => root))
    view(renderer)
    return renderer.template
  }
}
