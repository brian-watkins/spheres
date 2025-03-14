import { Stateful, Store } from "../../store/index.js";
import { getTokenRegistry } from "../../store/store.js";
import { GetState, runQuery, State, TokenRegistry } from "../../store/tokenRegistry.js";
import { voidElements } from "../../view/elementData.js";
import { HTMLBuilder, HTMLView } from "../../view/index.js";
import { EventsToDelegate, StoreEventHandler } from "../../view/render/index.js";
import { listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "../../view/render/fragmentHelpers.js";
import { IdSequence } from "../../view/render/idSequence.js";
import { ViteContext } from "./viteBuilder.js";
import { AbstractViewRenderer, ElementDefinition, isStateful, ViewDefinition, ViewRendererDelegate, ViewSelector } from "../../view/render/viewRenderer.js";
import { ListItemTemplateContext } from "../../view/render/templateContext.js";
import { TransformRendererDelegate } from "./transformDelegate.js";
import { AbstractViewConfig, ViewConfigDelegate } from "../../view/render/viewConfig.js";
import { AbstractSelectorBuilder } from "../../view/render/selectorBuilder.js";
import { BooleanAttributesDelegate } from "../../view/render/htmlDelegate.js";

type StatefulString = (registry: TokenRegistry) => string

export interface HTMLTemplate {
  strings: Array<string>
  statefuls: Array<StatefulString>
}

export function buildStringRenderer(view: HTMLView, viteContext?: ViteContext): (store: Store) => string {
  const renderer = new StringRenderer(new StringRendererDelegate(), viteContext, new IdSequence())

  view(renderer as unknown as HTMLBuilder)
  const template = renderer.template

  return (store) => {
    return stringForTemplate(getTokenRegistry(store), template)
  }
}

class StringRenderer extends AbstractViewRenderer {
  readonly template: HTMLTemplate = {
    strings: [""],
    statefuls: []
  }

  constructor(delegate: ViewRendererDelegate, private viteContext: ViteContext | undefined, private idSequence: IdSequence, private isTemplate: boolean = false) {
    super(delegate)
  }

  private appendToTemplate(next: HTMLTemplate) {
    addTemplate(this.template, next)
  }

  textNode(value: string | Stateful<string>): this {
    if (isStateful(value)) {
      this.appendToTemplate({
        strings: ["", ""],
        statefuls: [toStatefulString(value)]
      })
    } else {
      this.appendToTemplate({ strings: [value], statefuls: [] })
    }

    return this
  }

  element(tag: string, builder?: ElementDefinition): this {
    const elementId = this.idSequence.next
    if (tag === "script" || tag === "link") {
      const delegate = new TransformRendererDelegate(this.viteContext)
      const children = new StringRenderer(delegate, this.viteContext, this.idSequence)
      const config = new StringConfig(delegate.getConfigDelegate(tag), elementId)
      builder?.({
        config,
        children: children
      })
      if (delegate.template !== undefined) {
        this.appendToTemplate(delegate.template)
        return this
      }
    }

    const config = new StringConfig(this.delegate.getConfigDelegate(tag), elementId)
    const children = new StringRenderer(this.delegate, this.viteContext, this.idSequence)

    if (this.isTemplate) {
      config.attribute("data-spheres-template", "")
    }

    builder?.({
      config,
      children: children
    })

    this.appendToTemplate({
      strings: [`<${tag}`],
      statefuls: []
    })

    this.appendToTemplate(config.template)

    this.appendToTemplate({
      strings: ['>'],
      statefuls: []
    })

    if (voidElements().has(tag)) {
      return this
    }

    if (this.viteContext !== undefined && this.viteContext.command === "serve" && tag === "head") {
      this.appendToTemplate({
        strings: [`<script type="module" src="/@vite/client"></script>`],
        statefuls: []
      })
    }

    if (config.innerHTMLContent !== undefined) {
      if (isStateful(config.innerHTMLContent)) {
        this.appendToTemplate({
          strings: ["", ""],
          statefuls: [
            toStatefulString(config.innerHTMLContent)
          ]
        })
      } else {
        this.appendToTemplate({
          strings: [config.innerHTMLContent],
          statefuls: []
        })
      }
    } else {
      this.appendToTemplate(children.template)
    }

    this.appendToTemplate({
      strings: [`</${tag}>`],
      statefuls: []
    })

    return this
  }

  subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    const elementId = this.idSequence.next

    const renderer = new StringRenderer(this.delegate, this.viteContext, new IdSequence(elementId), true)
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
            let overlayRegistry = templateContext.createOverlayRegistry(registry, listData[i], i)
            html += stringForTemplate(overlayRegistry, renderer.template)
          }
          return html
        }
      ]
    })

    return this
  }

  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = this.idSequence.next
    const templateSelectorBuilder = new StringTemplateSelectorBuilder(this.delegate, this.viteContext, elementId)
    selectorGenerator(templateSelectorBuilder)
    const selectors = templateSelectorBuilder.selectors

    this.appendToTemplate({
      strings: [
        `<!--${switchStartIndicator(elementId)}-->`,
        `<!--${switchEndIndicator(elementId)}-->`
      ],
      statefuls: [
        (registry) => {
          const selectedIndex = runQuery(registry, (get) => {
            return selectors.findIndex(selector => selector.select(get))
          })
          if (selectedIndex === -1) {
            return ""
          }
          return stringForTemplate(registry, selectors[selectedIndex].template())
        }
      ]
    })

    return this
  }
}

class StringTemplateSelectorBuilder extends AbstractSelectorBuilder<HTMLTemplate> {
  constructor(private delegate: ViewRendererDelegate, private viteContext: ViteContext | undefined, private elementId: string) {
    super()
  }

  protected createTemplate(view: ViewDefinition, selectorId: number): HTMLTemplate {
    const renderer = new StringRenderer(this.delegate, this.viteContext, new IdSequence(`${this.elementId}.${selectorId}`), true)
    view(renderer as unknown as HTMLBuilder)
    return renderer.template
  }
}

class StringConfig extends AbstractViewConfig {
  readonly template: HTMLTemplate = {
    strings: [""],
    statefuls: []
  }

  innerHTMLContent: string | Stateful<string> | undefined = undefined

  constructor(delegate: ViewConfigDelegate, private elementId: string) {
    super(delegate)
  }

  private appendToTemplate(next: HTMLTemplate) {
    addTemplate(this.template, next)
  }

  innerHTML(html: string | Stateful<string>): this {
    this.innerHTMLContent = html
    return this
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (isStateful(value)) {
      this.appendToTemplate({
        strings: ["", ""],
        statefuls: [
          toStatefulString((get) => {
            const attrValue = value(get)
            if (attrValue === undefined) {
              return ""
            } else {
              return ` ${name}="${attrValue}"`
            }
          })
        ]
      })
    } else {
      this.appendToTemplate({
        strings: [` ${name}="${value}"`],
        statefuls: []
      })
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

function toStatefulString(stateful: Stateful<string>): StatefulString {
  return (registry) => runQuery(registry, stateful) ?? ""
}

function stringForTemplate(registry: TokenRegistry, template: HTMLTemplate): string {
  let html = ""
  for (let x = 0; x < template.strings.length; x++) {
    html += template.strings[x]
    if (x < template.statefuls.length) {
      html += template.statefuls[x](registry)
    }
  }
  return html
}

function addTemplate(current: HTMLTemplate, next: HTMLTemplate): void {
  let currentString = current.strings[current.strings.length - 1]
  currentString = currentString + (next.strings[0] ?? "")
  if (next.strings.length > 1) {
    current.strings[current.strings.length - 1] = currentString
    current.strings = current.strings.concat(next.strings.slice(1))
    current.statefuls = current.statefuls.concat(next.statefuls ?? [])
  } else {
    current.strings[current.strings.length - 1] = currentString
  }
}

class StringRendererDelegate implements ViewRendererDelegate {
  private configDelegate = new BooleanAttributesDelegate()

  createElement(): Element {
    throw new Error("SSR Renderer should not create element");
  }

  getConfigDelegate(): ViewConfigDelegate {
    return this.configDelegate
  }
}