import { DOMEventType, EventsToDelegate, StoreEventHandler, EventZone } from "./index.js";
import { Stateful, GetState } from "../../store/index.js";
import { dispatchMessage } from "../../store/message.js";
import { getStateFunctionWithListener, initListener, createSubscriber, TokenRegistry } from "../../store/tokenRegistry.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { activateSelect, SelectViewEffect } from "./effects/selectViewEffect.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { getEventAttribute } from "./eventHelpers.js";
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId, listEndIndicator } from "./fragmentHelpers.js";
import { createDOMTemplate, DomTemplateRenderer } from "./templateRenderer.js";
import { AbstractViewConfig } from "./viewConfig.js";
import { AbstractViewRenderer, ElementDefinition, isStateful, UseData, ViewDefinition, ViewSelector } from "./viewRenderer.js";
import { IdSequence } from "./idSequence.js";
import { EffectLocation } from "./effectLocation.js";
import { ListItemTemplateContext } from "./templateContext.js";
import { activateList, ListEffect } from "./effects/listEffect.js";
import { SelectorBuilder } from "./selectorBuilder.js";
import { ElementConfigSupport, ElementSupport } from "../elementSupport.js";
import { DOMRoot } from "./domRoot.js";

export class ActivateDomRenderer extends AbstractViewRenderer {
  private currentNode: Node | null
  private currentLocation: EffectLocation

  constructor(private elementSupport: ElementSupport, private zone: DOMRoot, private registry: TokenRegistry, node: Node, location: EffectLocation) {
    super()

    this.currentNode = node
    this.currentLocation = location
  }

  textNode(value: string | Stateful<string>): this {
    if (isStateful(value)) {
      const effect = new UpdateTextEffect(value)
      initListener(this.registry, effect, this.currentLocation.findNode(this.zone.root))
    }

    this.currentNode = this.currentNode!.nextSibling
    this.currentLocation = this.currentLocation.nextSibling()

    return this
  }

  element(tag: string, builder?: ElementDefinition, support?: ElementSupport): this {
    const renderSupport = support ?? this.elementSupport

    builder?.({
      config: new ActivateDomConfig(renderSupport.getConfigSupport(tag), this.zone, this.registry, this.zone.root, this.currentNode as Element, this.currentLocation),
      children: new ActivateDomRenderer(renderSupport, this.zone, this.registry, this.currentNode!.firstChild!, this.currentLocation.firstChild())
    })

    this.currentNode = this.currentNode!.nextSibling
    this.currentLocation = this.currentLocation.nextSibling()

    return this
  }

  subviews<T>(query: (get: GetState) => T[], viewGenerator: (useData: UseData<T>) => ViewDefinition): this {
    const elementId = getListElementId(this.currentNode!)
    let end = findListEndNode(this.currentNode!, elementId)

    const renderer = new DomTemplateRenderer(this.elementSupport, this.zone, new IdSequence(elementId), new EffectLocation(root => root))
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    const effect = new ListEffect(this.registry, renderer.template, query, templateContext, this.currentNode!, end)
    const data = query(getStateFunctionWithListener(createSubscriber(this.registry, effect)))
    const virtualList = activateList(this.registry, templateContext, renderer.template, this.currentNode!, end, data)
    effect.setVirtualList(virtualList)

    this.currentNode = end.nextSibling
    this.currentLocation = this.currentLocation.nextCommentSiblingMatching(listEndIndicator(elementId)).nextSibling()

    return this
  }

  subviewFrom(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = getSwitchElementId(this.currentNode!)
    let end = findSwitchEndNode(this.currentNode!, elementId)

    const selectorBuilder = new SelectorBuilder(createDOMTemplate(this.elementSupport, this.zone, elementId))
    selectorGenerator(selectorBuilder)

    const effect = new SelectViewEffect(this.registry, selectorBuilder.selectors, this.currentNode!, end)
    activateSelect(this.registry, selectorBuilder.selectors, this.currentNode!, getStateFunctionWithListener(createSubscriber(this.registry, effect)))

    this.currentNode = end.nextSibling
    this.currentLocation = this.currentLocation.nextSibling()

    return this
  }
}

class ActivateDomConfig extends AbstractViewConfig {
  constructor(configSupport: ElementConfigSupport, private zone: EventZone, private registry: TokenRegistry, private root: Node, private element: Element, private location: EffectLocation) {
    super(configSupport)
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (isStateful(value)) {
      const attributeEffect = new UpdateAttributeEffect(name, value)
      initListener(this.registry, attributeEffect, this.location.findNode(this.root))
    }
    return this
  }

  property<T extends string | boolean>(name: string, value: T | Stateful<T>): this {
    if (isStateful(value)) {
      const propertyEffect = new UpdatePropertyEffect(name, value)
      initListener(this.registry, propertyEffect, this.location.findNode(this.root))
    }

    return this
  }

  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this {
    if (EventsToDelegate.has(event)) {
      const elementId = getEventAttribute(this.element, event)
      if (elementId !== null) {
        this.zone.addEvent(DOMEventType.Element, elementId, event, handler)
      } else {
        console.log(`Unable to activate a ${event} event for element`, this.element)
      }
    } else {
      this.element.addEventListener(event, (evt) => {
        dispatchMessage(this.registry, handler(evt))
      })
    }

    return this
  }
}
