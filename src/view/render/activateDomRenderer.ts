import { DOMEventType, EventsToDelegate, StoreEventHandler, EventZone } from "./index.js";
import { Stateful, GetState, State } from "../../store/index.js";
import { dispatchMessage } from "../../store/message.js";
import { subscribeOnGet, initListener, TokenRegistry } from "../../store/tokenRegistry.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { activateSelect, SelectViewEffect } from "./effects/selectViewEffect.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { getEventAttribute } from "./eventHelpers.js";
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "./fragmentHelpers.js";
import { createDOMTemplate, DomTemplateRenderer } from "./templateRenderer.js";
import { AbstractViewConfig, ViewConfigDelegate } from "./viewConfig.js";
import { AbstractViewRenderer, ElementDefinition, isStateful, ViewDefinition, ViewRendererDelegate, ViewSelector } from "./viewRenderer.js";
import { IdSequence } from "./idSequence.js";
import { EffectLocation } from "./effectLocation.js";
import { ListItemTemplateContext } from "./templateContext.js";
import { activateList, ListEffect } from "./effects/listEffect.js";
import { SelectorBuilder } from "./selectorBuilder.js";

export class ActivateDomRenderer extends AbstractViewRenderer {
  private currentNode: Node | null

  constructor(delegate: ViewRendererDelegate, private zone: EventZone, private registry: TokenRegistry, node: Node) {
    super(delegate)
    this.currentNode = node
  }

  textNode(value: string | Stateful<string>): this {
    if (isStateful(value)) {
      const effect = new UpdateTextEffect(this.registry, this.currentNode as Text, value)
      initListener(effect)
    }

    this.currentNode = this.currentNode!.nextSibling

    return this
  }

  element(tag: string, builder?: ElementDefinition): this {
    builder?.({
      config: new ActivateDomConfig(this.delegate.getConfigDelegate(tag), this.zone, this.registry, this.currentNode as Element),
      children: new ActivateDomRenderer(this.delegate, this.zone, this.registry, this.currentNode!.firstChild!)
    })

    this.currentNode = this.currentNode!.nextSibling

    return this
  }

  subviews<T>(query: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    const elementId = getListElementId(this.currentNode!)
    let end = findListEndNode(this.currentNode!, elementId)

    const renderer = new DomTemplateRenderer(this.delegate, this.zone, new IdSequence(elementId), new EffectLocation(root => root))
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    const effect = new ListEffect(this.registry, renderer.template, query, templateContext, this.currentNode!, end)
    const data = query(subscribeOnGet(effect))
    const virtualList = activateList(this.registry, templateContext, renderer.template, this.currentNode!, end, data)
    effect.setVirtualList(virtualList)

    this.currentNode = end.nextSibling

    return this
  }

  subviewFrom(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = getSwitchElementId(this.currentNode!)
    let end = findSwitchEndNode(this.currentNode!, elementId)

    const selectorBuilder = new SelectorBuilder(createDOMTemplate(this.delegate, this.zone, elementId))
    selectorGenerator(selectorBuilder)

    const effect = new SelectViewEffect(this.registry, selectorBuilder.selectors, this.currentNode!, end)
    activateSelect(this.registry, selectorBuilder.selectors, this.currentNode!, subscribeOnGet(effect))

    this.currentNode = end.nextSibling

    return this
  }
}

class ActivateDomConfig extends AbstractViewConfig {
  constructor(delegate: ViewConfigDelegate, private zone: EventZone, private registry: TokenRegistry, private element: Element) {
    super(delegate)
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (isStateful(value)) {
      const attributeEffect = new UpdateAttributeEffect(this.registry, this.element, name, value)
      initListener(attributeEffect)
    }
    return this
  }

  property<T extends string | boolean>(name: string, value: T | Stateful<T>): this {
    if (isStateful(value)) {
      const propertyEffect = new UpdatePropertyEffect(this.registry, this.element, name, value)
      initListener(propertyEffect)
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
