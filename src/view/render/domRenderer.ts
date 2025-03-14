import { EventsToDelegate, StoreEventHandler, Zone } from "./index.js"
import { Stateful } from "../../store/index.js"
import { dispatchMessage } from "../../store/message.js"
import { GetState, initListener, State, TokenRegistry } from "../../store/tokenRegistry.js"
import { UpdateAttributeEffect } from "./effects/attributeEffect.js"
import { UpdatePropertyEffect } from "./effects/propertyEffect.js"
import { SelectViewEffect } from "./effects/selectViewEffect.js"
import { UpdateTextEffect } from "./effects/textEffect.js"
import { setEventAttribute } from "./eventHelpers.js"
import { listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers.js"
import { IdSequence } from "./idSequence.js"
import { DomTemplateSelectorBuilder, initListEffect } from "./templateRenderer.js"
import { AbstractViewConfig, ViewConfigDelegate } from "./viewConfig.js"
import { AbstractViewRenderer, ConfigurableElement, isStateful, ViewDefinition, ViewRendererDelegate, ViewSelector } from "./viewRenderer.js"

export class DomRenderer extends AbstractViewRenderer {
  constructor(delegate: ViewRendererDelegate, protected zone: Zone, protected registry: TokenRegistry, protected idSequence: IdSequence, protected root: Element) {
    super(delegate)
  }

  textNode(value: string | Stateful<string>) {
    if (isStateful(value)) {
      const textNode = document.createTextNode("")
      this.root.appendChild(textNode)
      const textEffect = new UpdateTextEffect(this.registry, textNode, value)
      initListener(textEffect)
    } else {
      this.root.appendChild(document.createTextNode(value))
    }
    return this
  }

  element(tag: string, builder?: (element: ConfigurableElement<any, any>) => void): this {
    const el = this.delegate.createElement(tag)

    const elementId = this.idSequence.next

    builder?.({
      config: new DomElementConfig(this.delegate.getConfigDelegate(tag), this.zone, this.registry, elementId, el),
      children: new DomRenderer(this.delegate, this.zone, this.registry, this.idSequence, el)
    })

    this.root.appendChild(el)

    return this
  }

  subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    const elementId = this.idSequence.next
    const listStartNode = document.createComment(listStartIndicator(elementId))
    const listEndNode = document.createComment(listEndIndicator(elementId))
    const parentFrag = document.createDocumentFragment()
    parentFrag.appendChild(listStartNode)
    parentFrag.appendChild(listEndNode)

    initListEffect(this.delegate, this.zone, this.registry, elementId, listStartNode, listEndNode, data, viewGenerator)

    this.root.appendChild(parentFrag)

    return this
  }

  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = this.idSequence.next
    const fragment = document.createDocumentFragment()
    let startNode = document.createComment(switchStartIndicator(elementId))
    let endNode = document.createComment(switchEndIndicator(elementId))
    fragment.appendChild(startNode)
    fragment.appendChild(endNode)

    const selectorBuilder = new DomTemplateSelectorBuilder(this.delegate, this.zone, elementId)
    selectorGenerator(selectorBuilder)

    const query = new SelectViewEffect(this.zone, this.registry, selectorBuilder.selectors, startNode, endNode)
    initListener(query)

    this.root.appendChild(fragment)

    return this
  }
}

class DomElementConfig extends AbstractViewConfig {
  constructor(delegate: ViewConfigDelegate, private zone: Zone, private registry: TokenRegistry, private elementId: string, private element: Element) {
    super(delegate)
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (isStateful(value)) {
      const attributeEffect = new UpdateAttributeEffect(this.registry, this.element, name, value)
      initListener(attributeEffect)
    } else {
      this.element.setAttribute(name, value)
    }
    return this
  }

  property<T extends string | boolean>(name: string, value: T | Stateful<T>) {
    if (isStateful(value)) {
      const propertyEffect = new UpdatePropertyEffect(this.registry, this.element, name, value)
      initListener(propertyEffect)
    } else {
      //@ts-ignore
      this.element[name] = value
    }
    return this
  }

  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this {
    if (EventsToDelegate.has(event)) {
      setEventAttribute(this.element, event, this.elementId)
      this.zone.addEvent("element", this.elementId, event, handler)
    } else {
      this.element.addEventListener(event, (evt) => {
        dispatchMessage(this.registry, handler(evt))
      })
    }

    return this
  }
}