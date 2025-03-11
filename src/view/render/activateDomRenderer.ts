import { DOMTemplate, EventsToDelegate, Zone } from ".";
import { Stateful, GetState, State } from "../../store";
import { dispatchMessage } from "../../store/message";
import { initListener, TokenRegistry } from "../../store/tokenRegistry";
import { AriaAttribute } from "../elementData";
import { SpecialElementAttributes } from "../specialAttributes";
import { DomTemplateSelectorBuilder } from "./domRenderer";
import { EffectLocation } from "./effectLocation";
import { UpdateAttributeEffect } from "./effects/attributeEffect";
import { ListEffect } from "./effects/listEffect";
import { UpdatePropertyEffect } from "./effects/propertyEffect";
import { SelectViewEffect } from "./effects/selectViewEffect";
import { UpdateTextEffect } from "./effects/textEffect";
import { getEventAttribute } from "./eventHelpers";
import { findListEndNode, findSwitchEndNode, getListElementId, getSwitchElementId } from "./fragmentHelpers";
import { IdSequence } from "./idSequence";
import { ListItemTemplateContext } from "./templateContext";
import { DomTemplateRenderer } from "./templateRenderer";
import { ConfigurableElement, ElementDefinition, ViewConfig, ViewConfigDelegate, ViewDefinition, ViewRenderer, ViewRendererDelegate, ViewSelector } from "./viewRenderer";
import { StoreEventHandler } from "./virtualNode";

export class ActivateDomRenderer implements ViewRenderer {
  private currentNode: Node | null

  constructor(private delegate: ViewRendererDelegate, private zone: Zone, private registry: TokenRegistry, node: Node) {
    this.currentNode = node
  }

  textNode(value: string | Stateful<string>): this {
    if (typeof value === "function") {
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
    console.log("Activating subviews", elementId)
    let end = findListEndNode(this.currentNode!, elementId)

    const templateElement = document.createElement("template")

    console.log("CReating new idsequence for list item template", elementId)
    const renderer = new DomTemplateRenderer(this.delegate, this.zone, new IdSequence(elementId), templateElement.content, new EffectLocation(root => root))
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    const domTemplate: DOMTemplate = {
      isFragment: renderer.isFragment,
      rootType: renderer.rootType,
      element: templateElement,
      effects: renderer.effectTemplates
    }


    // const effect = new ListEffect(this.zone, this.registry, vnode, node, end, getDOMTemplate)
    const effect = new ListEffect(this.zone, this.registry, domTemplate, data, templateContext, this.currentNode!, end)
    initListener(effect)

    this.currentNode = end.nextSibling

    return this
  }

  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = getSwitchElementId(this.currentNode!)
    console.log("Activating conditional view", elementId)
    let end = findSwitchEndNode(this.currentNode!, elementId)

    const selectorBuilder = new DomTemplateSelectorBuilder(this.delegate, this.zone, elementId)
    selectorGenerator(selectorBuilder)


    // const effect = new SelectViewEffect(zone, registry, vnode, node, end, getDOMTemplate)
    const effect = new SelectViewEffect(this.zone, this.registry, selectorBuilder.selectors, this.currentNode!, end)
    initListener(effect)

    this.currentNode = end.nextSibling

    return this
  }

}

class ActivateDomConfig implements ViewConfig {
  //@ts-ignore
  constructor(private delegate: ViewConfigDelegate, private zone: Zone, private registry: TokenRegistry, private element: Element) { }

  dataAttribute(name: string, value: string | Stateful<string>): this {
    return this.attribute(`data-${name}`, value)
  }

  innerHTML(_: string | Stateful<string>): this {
    throw new Error("Method not implemented. AA");
  }

  aria(_: AriaAttribute, __: string | Stateful<string>): this {
    throw new Error("Method not implemented. BB");
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (typeof value === "function") {
      const attributeEffect = new UpdateAttributeEffect(this.registry, this.element, name, value)
      initListener(attributeEffect)
    }
    return this
  }

  property<T extends string | boolean>(name: string, value: T | Stateful<T>): this {
    if (typeof value === "function") {
      const propertyEffect = new UpdatePropertyEffect(this.registry, this.element, name, value)
      initListener(propertyEffect)
    }

    return this
  }

  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this {

    // const elementEvents = vnode.data.on
    // for (const k in elementEvents) {
    if (EventsToDelegate.has(event)) {
      console.log("Adding event to zone", event)
      const elementId = getEventAttribute(this.element, event)
      this.zone.addEvent("element", elementId, event, handler)
    } else {
      // const handler = elementEvents[k]
      console.log("Adding event to element", event, this.element.nodeValue)
      this.element.addEventListener(event, (evt) => {
        dispatchMessage(this.registry, handler(evt))
      })
    }

    return this
  }

}

// const MagicConfig = new Proxy({}, {
//   get: (_, prop, receiver) => {
//     const attribute = prop as string
//     if (booleanAttributes.has(attribute)) {
//       return function (isSelected: boolean | Stateful<boolean>) {
//         return receiver.recordBooleanAttribute(attribute, isSelected)
//       }
//     } else {
//       return function (value: string | Stateful<string>) {
//         return receiver.recordAttribute(attribute, value)
//       }
//     }
//   }
// })

const MagicConfig = new Proxy({}, {
  get: (_, prop, receiver) => {
    const attribute = prop as string
    // if (booleanAttributes.has(attribute)) {
    //   return function (isSelected: boolean | Stateful<boolean>) {
    //     if (typeof isSelected === "function") {
    //       receiver.delegate.defineAttribute(receiver, attribute, (get: GetState) => isSelected(get) ? attribute : undefined)
    //     } else {
    //       receiver.delegate.defineAttribute(receiver, attribute, isSelected ? attribute : undefined)
    //     }
    //     return receiver
    //     // return receiver.recordBooleanAttribute(attribute, isSelected)
    //   }
    // } else {
    return function (value: string | Stateful<string>) {
      // return receiver.recordAttribute(attribute, value)
      receiver.delegate.defineAttribute(receiver, attribute, value)
      return receiver
    }
    // }
  }
})


Object.setPrototypeOf(ActivateDomConfig.prototype, MagicConfig)


const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <A extends SpecialElementAttributes, B>(element: ConfigurableElement<A, B>) => void) {
      return receiver.element(prop as string, builder)
    }
  }
})

Object.setPrototypeOf(ActivateDomRenderer.prototype, MagicElements)
