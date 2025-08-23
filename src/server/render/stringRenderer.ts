import { Stateful, Store } from "../../store/index.js";
import { Container, write } from "../../store/state/container.js"
import { getTokenRegistry } from "../../store/store.js";
import { GetState, runQuery, State } from "../../store/tokenRegistry.js";
import { voidElements } from "../../view/elementData.js";
import { HTMLBuilder, HTMLView } from "../../view/index.js";
import { EventsToDelegate, StoreEventHandler } from "../../view/render/index.js";
import { listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "../../view/render/fragmentHelpers.js";
import { IdSequence } from "../../view/render/idSequence.js";
import { ViteContext } from "./viteContext.js";
import { AbstractViewRenderer, ElementDefinition, isStateful, ViewDefinition, ViewSelector } from "../../view/render/viewRenderer.js";
import { createOverlayRegistry, ListItemTemplateContext } from "../../view/render/templateContext.js";
import { AbstractViewConfig } from "../../view/render/viewConfig.js";
import { SelectorBuilder } from "../../view/render/selectorBuilder.js";
import { addTemplate, emptyTemplate, HTMLTemplate, stringForTemplate, templateFromStateful, templateFromString, toStatefulString } from "./template.js";
import { HeadElementRenderer } from "./elementRenderers/headElementRenderer.js";
import { HtmlElementRenderer } from "./elementRenderers/htmlElementRenderer.js";
import { BodyElementRenderer } from "./elementRenderers/bodyElementRenderer.js";
import { BaseElementRenderer, ElementRenderer } from "./elementRenderers/elementRenderer.js";
import { ScriptElementRenderer } from "./elementRenderers/scriptElementRenderer.js";
import { getActivationTemplate, storeIdToken } from "./elementRenderers/activationElements.js";
import { LinkElementRenderer } from "./elementRenderers/linkElementRenderer.js";
import { BasicElementConfigSupport, ElementConfigSupport, ElementSupport } from "../../view/elementSupport.js";

export interface StringRendererOptions {
  stateMap?: Record<string, Container<any>>
  activationScripts?: Array<string>
  viteContext?: ViteContext
}

export function buildStringRenderer(view: HTMLView, options: StringRendererOptions): (store: Store) => string {
  const renderer = new StringRenderer(new HTMLMarkupSupport(), options, new IdSequence())
  renderer.subview(view)

  const template = renderer.hasBodyElement ?
    renderer.template :
    addTemplate(renderer.template, getActivationTemplate(options))

  return (store) => {
    store.dispatch(write(storeIdToken, store.id))
    return stringForTemplate(getTokenRegistry(store), template)
  }
}

const ZERO_WIDTH_SPACE = "&#x200b;"

class StringRenderer extends AbstractViewRenderer {
  hasBodyElement: boolean = false

  template: HTMLTemplate = emptyTemplate()

  constructor(private elementSupport: ElementSupport, private options: StringRendererOptions, private idSequence: IdSequence, private isTemplate: boolean = false) {
    super()
  }

  private appendToTemplate(next: HTMLTemplate) {
    this.template = addTemplate(this.template, next)
  }

  private appendStringToTemplate(content: string) {
    this.appendToTemplate(templateFromString(content))
  }

  textNode(value: string | Stateful<string>): this {
    if (isStateful(value)) {
      this.appendToTemplate(templateFromStateful(toStatefulString(value, ZERO_WIDTH_SPACE)))
    } else {
      this.appendStringToTemplate(value)
    }

    return this
  }

  private getElementRenderer(tag: string): ElementRenderer {
    switch (tag) {
      case "head":
        return new HeadElementRenderer(this.options.viteContext)
      case "html":
        return new HtmlElementRenderer()
      case "body":
        this.hasBodyElement = true
        return new BodyElementRenderer(this.options.viteContext, this.options.stateMap, this.options.activationScripts)
      case "script":
        return new ScriptElementRenderer(this.options.viteContext)
      case "link":
        return new LinkElementRenderer(this.options.viteContext)
      default:
        return new BaseElementRenderer()
    }
  }

  element(tag: string, builder?: ElementDefinition, support?: ElementSupport): this {
    const elementId = this.idSequence.next

    const rendererDelegate = support ?? this.elementSupport
    const elementRenderer = this.getElementRenderer(tag)

    const configSupport = elementRenderer.getConfigSupport() ?? rendererDelegate.getConfigSupport(tag)

    const config = new StringConfig(configSupport, elementId)
    const children = new StringRenderer(rendererDelegate, this.options, this.idSequence)

    if (this.isTemplate) {
      config.attribute("data-spheres-template", "")
    }

    builder?.({
      config,
      children: children
    })

    this.appendToTemplate(elementRenderer.preTagTemplate())

    this.appendStringToTemplate(`<${tag}`)

    this.appendToTemplate(config.template)

    this.appendStringToTemplate(">")

    if (voidElements().has(tag)) {
      return this
    }

    this.appendToTemplate(elementRenderer.preChildrenTemplate())

    if (config.innerHTMLContent !== undefined) {
      if (isStateful(config.innerHTMLContent)) {
        this.appendToTemplate(templateFromStateful(toStatefulString(config.innerHTMLContent)))
      } else {
        this.appendStringToTemplate(config.innerHTMLContent)
      }
    } else {
      this.appendToTemplate(children.template)
      if (children.hasBodyElement) {
        this.hasBodyElement = true
      }
    }

    this.appendToTemplate(elementRenderer.postChildrenTemplate())

    this.appendStringToTemplate(`</${tag}>`)

    this.appendToTemplate(elementRenderer.postTagTemplate())

    return this
  }

  subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    const elementId = this.idSequence.next

    const renderer = new StringRenderer(this.elementSupport, this.options, new IdSequence(elementId), true)
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    this.appendToTemplate({
      strings: [
        `<!--${listStartIndicator(elementId)}-->`,
        `<!--${listEndIndicator(elementId)}-->`
      ],
      statefuls: [
        (registry) => {
          const listData = runQuery(registry, data)
          let html: string = ""
          for (let i = 0; i < listData.length; i++) {
            let overlayRegistry = createOverlayRegistry(templateContext, registry, listData[i], i)
            html += stringForTemplate(overlayRegistry, renderer.template)
          }
          return html
        }
      ]
    })

    return this
  }

  subviewFrom(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = this.idSequence.next
    const templateSelectorBuilder = new SelectorBuilder(createStringTemplate(this.elementSupport, this.options, elementId))
    selectorGenerator(templateSelectorBuilder)
    const selectors = templateSelectorBuilder.selectors

    this.appendToTemplate({
      strings: [
        `<!--${switchStartIndicator(elementId)}-->`,
        `<!--${switchEndIndicator(elementId)}-->`
      ],
      statefuls: [
        (registry) => {
          const selector = runQuery(registry, (get) => selectors.findSelector(get))
          switch (selector.type) {
            case "empty": {
              return ""
            }
            case "case-selector": {
              const templateContext = selector.templateContext()
              return stringForTemplate(
                templateContext.overlayRegistry(registry),
                templateContext.template
              )
            }
            case "condition-selector": {
              return stringForTemplate(registry, selector.template())
            }
          }

        }
      ]
    })

    return this
  }
}

function createStringTemplate(elementSupport: ElementSupport, options: StringRendererOptions, elementId: string): (view: ViewDefinition, selectorId: number) => HTMLTemplate {
  return (view, selectorId) => {
    const renderer = new StringRenderer(elementSupport, options, new IdSequence(`${elementId}.${selectorId}`), true)
    view(renderer as unknown as HTMLBuilder)
    return renderer.template
  }
}

class StringConfig extends AbstractViewConfig {
  template: HTMLTemplate = {
    strings: [""],
    statefuls: []
  }

  innerHTMLContent: string | Stateful<string> | undefined = undefined

  constructor(configSupport: ElementConfigSupport, private elementId: string) {
    super(configSupport)
  }

  private appendToTemplate(next: HTMLTemplate) {
    this.template = addTemplate(this.template, next)
  }

  innerHTML(html: string | Stateful<string>): this {
    this.innerHTMLContent = html
    return this
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (isStateful(value)) {
      this.appendToTemplate(templateFromStateful(toStatefulString(get => {
        const attrValue = value(get)
        if (attrValue === undefined) {
          return ""
        } else {
          return attributeString(name, attrValue)
        }
      })))
    } else {
      this.appendToTemplate(templateFromString(attributeString(name, value)))
    }

    return this
  }

  property<T extends string | boolean>(_: string, __: T | Stateful<T>): this {
    throw new Error("Method not implemented.");
  }

  on<E extends keyof HTMLElementEventMap | string>(event: E, _: StoreEventHandler<any>): this {
    if (EventsToDelegate.has(event)) {
      return this.attribute(`data-spheres-${event}`, this.elementId)
    } else {
      return this
    }
  }
}

function attributeString(name: string, value: string): string {
  const valuePart = value === "" ? "" : `="${value}"`
  return ` ${name}${valuePart}`
}

class HTMLMarkupSupport implements ElementSupport {
  rootTag: string = "html"
  private configSupport = new BasicElementConfigSupport()

  createElement(_: string): Element {
    throw new Error("Creating elements not supported during SSR.");
  }
  
  getConfigSupport(): ElementConfigSupport {
    return this.configSupport
  }
}