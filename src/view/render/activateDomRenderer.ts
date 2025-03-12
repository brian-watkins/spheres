import { EventsToDelegate, StoreEventHandler, Zone } from "./index.js";
import { Stateful, GetState, State } from "../../store/index.js";
import { dispatchMessage } from "../../store/message.js";
import { initListener, TokenRegistry } from "../../store/tokenRegistry.js";
import { UpdateAttributeEffect } from "./effects/attributeEffect.js";
import { UpdatePropertyEffect } from "./effects/propertyEffect.js";
import { SelectViewEffect } from "./effects/selectViewEffect.js";
import { UpdateTextEffect } from "./effects/textEffect.js";
import { getEventAttribute } from "./eventHelpers.js";
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "./fragmentHelpers.js";
import { DomTemplateSelectorBuilder, initListEffect } from "./templateRenderer.js";
import { AbstractViewConfig, ViewConfigDelegate } from "./viewConfig.js";
import { ElementDefinition, isStateful, MagicElements, ViewDefinition, ViewRendererDelegate, ViewSelector } from "./viewRenderer.js";

export class ActivateDomRenderer extends MagicElements {
  private currentNode: Node | null

  constructor(private delegate: ViewRendererDelegate, private zone: Zone, private registry: TokenRegistry, node: Node) {
    super()
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
      children: new ActivateDomRenderer(this.delegate.getRendererDelegate(tag), this.zone, this.registry, this.currentNode!.firstChild!)
    })

    this.currentNode = this.currentNode!.nextSibling

    return this
  }

  subview(view: ViewDefinition): this {
    const renderer = new ActivateDomRenderer(this.delegate, this.zone, this.registry, this.currentNode!)
    view(renderer)

    this.currentNode = renderer.currentNode

    return this
  }

  subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    const elementId = getListElementId(this.currentNode!)
    let end = findListEndNode(this.currentNode!, elementId)

    initListEffect(this.delegate, this.zone, this.registry, elementId, this.currentNode!, end, data, viewGenerator)

    this.currentNode = end.nextSibling

    return this
  }

  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = getSwitchElementId(this.currentNode!)
    let end = findSwitchEndNode(this.currentNode!, elementId)

    const selectorBuilder = new DomTemplateSelectorBuilder(this.delegate, this.zone, elementId)
    selectorGenerator(selectorBuilder)

    const effect = new SelectViewEffect(this.zone, this.registry, selectorBuilder.selectors, this.currentNode!, end)
    initListener(effect)

    this.currentNode = end.nextSibling

    return this
  }
}

class ActivateDomConfig extends AbstractViewConfig {
  constructor(delegate: ViewConfigDelegate, private zone: Zone, private registry: TokenRegistry, private element: Element) {
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
      this.zone.addEvent("element", elementId, event, handler)
    } else {
      this.element.addEventListener(event, (evt) => {
        dispatchMessage(this.registry, handler(evt))
      })
    }

    return this
  }
}
