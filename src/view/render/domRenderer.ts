import { DOMTemplate, EventsToDelegate, Zone } from "."
import { Stateful } from "../../store"
import { dispatchMessage } from "../../store/message"
import { GetState, initListener, State, TokenRegistry } from "../../store/tokenRegistry"
import { AriaAttribute, booleanAttributes } from "../elementData"
import { SpecialElementAttributes } from "../specialAttributes"
import { EffectLocation } from "./effectLocation"
import { UpdateAttributeEffect } from "./effects/attributeEffect"
import { ListEffect } from "./effects/listEffect"
import { UpdatePropertyEffect } from "./effects/propertyEffect"
import { SelectViewEffect } from "./effects/selectViewEffect"
import { UpdateTextEffect } from "./effects/textEffect"
import { setEventAttribute } from "./eventHelpers"
import { listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers"
import { IdSequence } from "./idSequence"
import { getDOMTemplate } from "./template"
import { ListItemTemplateContext } from "./templateContext"
import { DomTemplateRenderer } from "./templateRenderer"
import { ConfigurableElement, ViewConfig, ViewConfigDelegate, ViewDefinition, ViewRenderer, ViewRendererDelegate, ViewSelector } from "./viewRenderer"
import { StoreEventHandler } from "./virtualNode"

export class DomRenderer implements ViewRenderer {
  constructor(private delegate: ViewRendererDelegate, protected zone: Zone, protected registry: TokenRegistry, protected idSequence: IdSequence, protected root: Element) { }

  textNode(value: string | Stateful<string>) {
    if (typeof value === "function") {
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
      children: new DomRenderer(this.delegate.getRendererDelegate(tag), this.zone, this.registry, this.idSequence, el)
    })

    this.root.appendChild(el)

    return this
  }

  subview(view: ViewDefinition): this {
    console.log("Mounting a subview")
    const renderer = new DomRenderer(this.delegate, this.zone, this.registry, this.idSequence, this.root)
    view(renderer)

    return this
  }

  subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    // vnode.id = idSequence.next
    const elementId = this.idSequence.next
    const listStartNode = document.createComment(listStartIndicator(elementId))
    const listEndNode = document.createComment(listEndIndicator(elementId))
    const parentFrag = document.createDocumentFragment()
    parentFrag.appendChild(listStartNode)
    parentFrag.appendChild(listEndNode)

    // get the view definition
    // here we inject the item and index tokens and record any user tokens
    // But if so then we need to get the DOMTemplate too since we have to
    // run the view definition to discover any user tokens.
    // It's like we need a different renderer, this is a DOMTemplateRenderer
    // But we need a ViewDefinition to use with the DOMTemplateRenderer
    // This will have to be a new object that gets the DomTemplate
    // which managing the tokens maybe DOMTemplate should be a class?
    // Or should be a subclass of DomTemplate since the tokens stuff only
    // applies to list item templates. BUT the string renderer also needs
    // to deal with the tokens and overlay registries ... 

    const templateElement = document.createElement("template")

    console.log("Renderer delegate", this.delegate)
    const renderer = new DomTemplateRenderer(this.delegate, this.zone, new IdSequence(elementId), templateElement.content, new EffectLocation(root => root))
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    const domTemplate: DOMTemplate = {
      isFragment: renderer.isFragment,
      rootType: renderer.rootType,
      element: templateElement,
      effects: renderer.effectTemplates
    }

    // create the DOMTemplate
    // getDOMTemplate(this.zone, new IdSequence(elementId), )

    // pass in the DOMTemplate, the query, and something that references tokens
    const effect = new ListEffect(this.zone, this.registry, domTemplate, data, templateContext, listStartNode, listEndNode)
    initListener(effect)

    this.root.appendChild(parentFrag)

    return this
  }

  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this {
    // vnode.id = idSequence.next
    // const fragment = document.createDocumentFragment()
    // let startNode = document.createComment(switchStartIndicator(vnode.id))
    // let endNode = document.createComment(switchEndIndicator(vnode.id))
    // fragment.appendChild(startNode)
    // fragment.appendChild(endNode)

    // const query = new SelectViewEffect(zone, registry, vnode, startNode, endNode, getDOMTemplate)
    // initListener(query)
    const elementId = this.idSequence.next
    const fragment = document.createDocumentFragment()
    let startNode = document.createComment(switchStartIndicator(elementId))
    let endNode = document.createComment(switchEndIndicator(elementId))
    fragment.appendChild(startNode)
    fragment.appendChild(endNode)

    // here we need to create a list of selector objects. (TemplateSelector)
    // so we need to call the selector generator with some ViewSelector instance
    // and this will get us the list of selector objects.
    const selectorBuilder = new DomTemplateSelectorBuilder(this.delegate, this.zone, elementId)
    selectorGenerator(selectorBuilder)

    // const query = new SelectViewEffect(this.zone, this.registry, vnode, startNode, endNode, getDOMTemplate)
    const query = new SelectViewEffect(this.zone, this.registry, selectorBuilder.selectors, startNode, endNode)
    initListener(query)

    this.root.appendChild(fragment)

    return this
  }
}

export interface DomTemplateSelector {
  select: (get: GetState) => boolean
  template: () => DOMTemplate
}

export class DomTemplateSelectorBuilder implements ViewSelector {
  private templateSelectors: Array<DomTemplateSelector> = []
  private defaultSelector: DomTemplateSelector | undefined = undefined

  constructor(private delegate: ViewRendererDelegate, private zone: Zone, private elementId: string) { }

  get selectors(): Array<DomTemplateSelector> {
    const selectors = [ ...this.templateSelectors ]

    if (this.defaultSelector) {
      selectors.push(this.defaultSelector)
    }

    return selectors
  }

  when(predicate: (get: GetState) => boolean, view: ViewDefinition): this {
    const index = this.templateSelectors.length
    this.templateSelectors.push({
      select: predicate,
      template: () => {
        const templateElement = document.createElement("template")

        // const renderer = new DomTemplateRenderer(this.zone, this.idSequence, templateElement.content, new EffectLocation(root => root))
        // new IdSequence(`${this.vnode.id}.${selectedIndex}`)
        const renderer = new DomTemplateRenderer(this.delegate, this.zone, new IdSequence(`${this.elementId}.${index}`), templateElement.content, new EffectLocation(root => root))
        view(renderer)
        
        const domTemplate: DOMTemplate = {
          isFragment: renderer.isFragment,
          rootType: renderer.rootType,
          element: templateElement,
          effects: renderer.effectTemplates
        }

        return domTemplate
      }
    })

    return this
  }

  default(view: ViewDefinition): void {
    this.defaultSelector = {
      select: () => true,
      template: () => {
        const templateElement = document.createElement("template")

        const renderer = new DomTemplateRenderer(this.delegate, this.zone, new IdSequence(`${this.elementId}.${this.templateSelectors.length}`), templateElement.content, new EffectLocation(root => root))
        view(renderer)
        
        const domTemplate: DOMTemplate = {
          isFragment: renderer.isFragment,
          rootType: renderer.rootType,
          element: templateElement,
          effects: renderer.effectTemplates
        }

        return domTemplate
      }
    }
  }

}

class DomElementConfig implements ViewConfig {
  constructor(private delegate: ViewConfigDelegate, private zone: Zone, private registry: TokenRegistry, private elementId: string, private element: Element) { }

  dataAttribute(name: string, value: string | Stateful<string> = "true") {
    return this.attribute(`data-${name}`, value)
  }

  innerHTML(html: string | Stateful<string>): this {
    return this.property("innerHTML", html)
  }

  aria(name: AriaAttribute, value: string | Stateful<string>): this {
    return this.attribute(`aria-${name}`, value)
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (typeof value === "function") {
      const attributeEffect = new UpdateAttributeEffect(this.registry, this.element, name, value)
      initListener(attributeEffect)
    } else {
      this.element.setAttribute(name, value)
    }
    return this
  }

  property<T extends string | boolean>(name: string, value: T | Stateful<T>) {
    if (typeof value === "function") {
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

Object.setPrototypeOf(DomElementConfig.prototype, MagicConfig)


const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <A extends SpecialElementAttributes, B>(element: ConfigurableElement<A, B>) => void) {
      return receiver.element(prop as string, builder)
    }
  }
})

Object.setPrototypeOf(DomRenderer.prototype, MagicElements)
