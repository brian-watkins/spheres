import { Stateful, Store, write } from "../../store/index.js";
import { Container, container } from "../../store/state/container.js"
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
import { shouldTransformImport, TransformRendererDelegate } from "./transformDelegate.js";
import { AbstractViewConfig, ViewConfigDelegate } from "../../view/render/viewConfig.js";
import { SelectorBuilder } from "../../view/render/selectorBuilder.js";
import { BooleanAttributesDelegate } from "../../view/render/htmlDelegate.js";
import { SerializedState } from "../../view/activate.js";

type StatefulString = (registry: TokenRegistry) => string

export interface HTMLTemplate {
  strings: Array<string>
  statefuls: Array<StatefulString>
}

export interface StringRendererOptions {
  stateMap?: Record<string, State<any>>
  activationScripts?: Array<string>
  viteContext?: ViteContext
}

export function buildStringRenderer(view: HTMLView, options: StringRendererOptions): (store: Store) => string {
  const renderer = new StringRenderer(new StringRendererDelegate(), options, new IdSequence())
  renderer.subview(view)

  const template = renderer.hasBodyElement ?
    renderer.template :
    addTemplate(renderer.template, getActivationTemplate(options))

  return (store) => {
    store.dispatch(write(storeIdToken, store.id))

    return stringForTemplate(getTokenRegistry(store), template)
  }
}

export function buildActivationScripts(options: StringRendererOptions): (store: Store) => string {
  const template = getActivationTemplate(options)

  return (store) => {
    store.dispatch(write(storeIdToken, store.id))

    return stringForTemplate(getTokenRegistry(store), template)
  }
}

function getActivationTemplate(options: StringRendererOptions): HTMLTemplate {
  const renderer = new StringRenderer(new StringRendererDelegate(), options, new IdSequence())
  if (options.stateMap) {
    renderer.subview(serializedStore(options.stateMap))
  }
  if (options.activationScripts) {
    for (const scriptSrc of options.activationScripts) {
      renderer
        .subview((root: HTMLBuilder) => {
          root.script(el => {
            el.config
              .type("module")
              .async(true)
              .src(scriptSrc)
          })
        })
    }
  }

  return renderer.template
}

const ZERO_WIDTH_SPACE = "&#x200b;"

class StringRenderer extends AbstractViewRenderer {
  hasBodyElement: boolean = false

  template: HTMLTemplate = {
    strings: [""],
    statefuls: []
  }

  constructor(delegate: ViewRendererDelegate, private options: StringRendererOptions, private idSequence: IdSequence, private isTemplate: boolean = false) {
    super(delegate)
  }

  private appendToTemplate(next: HTMLTemplate) {
    this.template = addTemplate(this.template, next)
  }

  private appendStringToTemplate(content: string) {
    this.appendToTemplate({
      strings: [content],
      statefuls: []
    })
  }

  textNode(value: string | Stateful<string>): this {
    if (isStateful(value)) {
      this.appendToTemplate({
        strings: ["", ""],
        statefuls: [toStatefulString(value, ZERO_WIDTH_SPACE)]
      })
    } else {
      this.appendStringToTemplate(value)
    }

    return this
  }

  element(tag: string, builder?: ElementDefinition): this {
    const elementId = this.idSequence.next

    if (shouldTransformImport(this.options.viteContext) && (tag === "script" || tag === "link")) {
      const delegate = new TransformRendererDelegate(this.options.viteContext)
      const children = new StringRenderer(delegate, this.options, this.idSequence)
      const config = new StringConfig(delegate.getConfigDelegate(tag), elementId)
      builder?.({
        config,
        children: children
      })
      this.appendToTemplate(delegate.template)
      return this
    }

    const config = new StringConfig(this.delegate.getConfigDelegate(tag), elementId)
    const children = new StringRenderer(this.delegate, this.options, this.idSequence)

    if (this.isTemplate) {
      config.attribute("data-spheres-template", "")
    }

    builder?.({
      config,
      children: children
    })

    if (tag === "html") {
      this.appendStringToTemplate("<!DOCTYPE html>")
    }

    this.appendStringToTemplate(`<${tag}`)

    this.appendToTemplate(config.template)

    this.appendStringToTemplate(">")

    if (voidElements().has(tag)) {
      return this
    }

    if (this.options.viteContext !== undefined && this.options.viteContext.command === "serve" && tag === "head") {
      this.appendStringToTemplate(`<script type="module" src="/@vite/client"></script>`)
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
        this.appendStringToTemplate(config.innerHTMLContent)
      }
    } else {
      this.appendToTemplate(children.template)
      if (children.hasBodyElement) {
        this.hasBodyElement = true
      }
    }

    if (tag === "body") {
      this.hasBodyElement = true
      this.appendToTemplate(getActivationTemplate(this.options))
    }

    this.appendStringToTemplate(`</${tag}>`)

    return this
  }

  subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    const elementId = this.idSequence.next

    const renderer = new StringRenderer(this.delegate, this.options, new IdSequence(elementId), true)
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

  subviewFrom(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = this.idSequence.next
    const templateSelectorBuilder = new SelectorBuilder(createStringTemplate(this.delegate, this.options, elementId))
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

function createStringTemplate(delegate: ViewRendererDelegate, options: StringRendererOptions, elementId: string): (view: ViewDefinition, selectorId: number) => HTMLTemplate {
  return (view, selectorId) => {
    const renderer = new StringRenderer(delegate, options, new IdSequence(`${elementId}.${selectorId}`), true)
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

  constructor(delegate: ViewConfigDelegate, private elementId: string) {
    super(delegate)
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
      this.appendToTemplate({
        strings: ["", ""],
        statefuls: [
          toStatefulString((get) => {
            const attrValue = value(get)
            if (attrValue === undefined) {
              return ""
            } else {
              return attributeString(name, attrValue)
            }
          })
        ]
      })
    } else {
      this.appendToTemplate({
        strings: [attributeString(name, value)],
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

function attributeString(name: string, value: string): string {
  const valuePart = value === "" ? "" : `="${value}"`
  return ` ${name}${valuePart}`
}

function toStatefulString(stateful: Stateful<string>, defaultValue: string = ""): StatefulString {
  return (registry) => runQuery(registry, stateful) || defaultValue
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

function addTemplate(current: HTMLTemplate, next: HTMLTemplate): HTMLTemplate {
  const added: HTMLTemplate = {
    strings: [...current.strings],
    statefuls: [...current.statefuls]
  }

  let currentString = added.strings[added.strings.length - 1]
  currentString = currentString + (next.strings[0] ?? "")
  if (next.strings.length > 1) {
    added.strings[added.strings.length - 1] = currentString
    added.strings = added.strings.concat(next.strings.slice(1))
    added.statefuls = added.statefuls.concat(next.statefuls ?? [])
  } else {
    added.strings[added.strings.length - 1] = currentString
  }

  return added
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

const storeIdToken = container({ initialValue: "" })


export function serializedStore(stateMap: Record<string, State<any>>): HTMLView {
  return root => {
    root.script(el => {
      el.config
        .type("application/json")
        .dataAttribute("spheres-store", get => get(storeIdToken))
      el.children.textNode(get => {
        const values: Array<SerializedState> = []

        for (const key in stateMap) {
          const token = stateMap[key]
          const serializedValue: SerializedState = {
            t: key,
            v: get(token)
          }

          if (token instanceof Container) {
            const metaValue = get(token.meta)
            if (metaValue.type !== "ok") {
              serializedValue.mv = metaValue
            }
          }

          values.push(serializedValue)
        }

        return JSON.stringify(values)
      })
    })
  }
}